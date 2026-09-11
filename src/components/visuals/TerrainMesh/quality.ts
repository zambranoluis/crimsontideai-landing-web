// Footer-only policy. Shared Home/Products meshes intentionally retain their
// existing two-second adaptation windows and startup tiers.
export class TerrainAdaptiveQuality {
  fps = 30;
  private duration = 0;
  private cost = 0;
  private samples = 0;
  private missed = 0;
  private overloadedWindows = 0;
  private headroomMilliseconds = 0;

  constructor(public tier: number) {}

  resetWindow() {
    this.duration = this.cost = this.samples = this.missed = 0;
    this.overloadedWindows = this.headroomMilliseconds = 0;
  }

  private clearSamples() {
    this.duration = this.cost = this.samples = this.missed = 0;
  }

  sample(cost: number, gap: number) {
    const interval = 1000 / this.fps;
    this.duration += gap;
    this.cost += cost;
    this.samples += 1;
    if (gap > interval * 1.5 + 1) this.missed += Math.max(1, Math.round(gap / interval) - 1);
    if (this.duration < 500) return false;

    const windowDuration = this.duration;
    const average = this.cost / this.samples;
    const missedRatio = this.missed / (this.samples + this.missed);
    const overloaded = average > 8 || missedRatio > .15;
    const stable = average < 4 && missedRatio < .05;
    this.overloadedWindows = overloaded ? this.overloadedWindows + 1 : 0;
    this.headroomMilliseconds = stable ? this.headroomMilliseconds + windowDuration : 0;
    this.clearSamples();

    if (this.overloadedWindows >= 2) {
      const changed = this.tier < 2 || this.fps !== 24;
      if (this.tier < 2) this.tier += 1;
      else this.fps = 24;
      this.overloadedWindows = this.headroomMilliseconds = 0;
      return changed;
    }
    if (this.headroomMilliseconds >= 10_000 && (this.tier > 0 || this.fps !== 30)) {
      this.tier = Math.max(0, this.tier - 1);
      this.fps = 30;
      this.overloadedWindows = this.headroomMilliseconds = 0;
      return true;
    }
    return false;
  }
}
