export const qualityTiers = [
  { name: "high", rows: 36, columns: 100, dpr: 1.5 },
  { name: "medium", rows: 28, columns: 72, dpr: 1.25 },
  { name: "low", rows: 20, columns: 52, dpr: 1 },
] as const;

export function backingSize(width: number, height: number, dpr: number, tier: number) {
  const ratio = Math.min(dpr, qualityTiers[tier].dpr, 2160 / Math.max(1, width), 1440 / Math.max(1, height));
  return { width: Math.max(1, Math.floor(width * ratio)), height: Math.max(1, Math.floor(height * ratio)), ratio };
}

// Timing inputs are explicit so tier decisions can be tested without hardware thresholds.
export class AdaptiveQuality {
  fps = 30;
  private duration = 0;
  private cost = 0;
  private samples = 0;
  private missed = 0;
  private overloaded = 0;
  private headroom = 0;
  constructor(public tier: number) {}

  resetWindow() {
    this.duration = this.cost = this.samples = this.missed = this.overloaded = this.headroom = 0;
  }

  sample(cost: number, gap: number) {
    const interval = 1000 / this.fps;
    this.duration += gap;
    this.cost += cost;
    this.samples++;
    if (gap > interval * 1.5 + 1) this.missed += Math.max(1, Math.round(gap / interval) - 1);
    if (this.duration < 2000) return false;
    const average = this.cost / this.samples;
    const missedRatio = this.missed / (this.samples + this.missed);
    const overload = average > 8 || missedRatio > .15;
    const stable = average < 4 && missedRatio < .05;
    this.overloaded = overload ? this.overloaded + 1 : 0;
    this.headroom = stable ? this.headroom + this.duration : 0;
    this.duration = this.cost = this.samples = this.missed = 0;
    if (this.overloaded >= 2) {
      const changed = this.tier < 2 || this.fps !== 24;
      if (this.tier < 2) this.tier++; else this.fps = 24;
      this.resetWindow();
      return changed;
    }
    if (this.headroom >= 10000 && (this.tier > 0 || this.fps !== 30)) {
      this.tier = Math.max(0, this.tier - 1);
      this.fps = 30;
      this.resetWindow();
      return true;
    }
    return false;
  }
}

export class FrameCadence {
  private remainder = 0;
  private gap = 0;
  reset() { this.remainder = this.gap = 0; }
  advance(delta: number, fps: number) {
    this.remainder += delta;
    this.gap += delta;
    const interval = 1000 / fps;
    if (this.remainder + .001 < interval) return 0;
    this.remainder %= interval;
    if (interval - this.remainder < .001) this.remainder = 0;
    const gap = this.gap;
    this.gap = 0;
    return gap;
  }
}
