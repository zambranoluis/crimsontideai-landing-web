export const RIPPLE_DURATION = 1200;
const controls = "a, button, input, textarea, select, summary, label, [role='button'], [role='link'], [role='slider'], [role='textbox'], [role='checkbox'], [role='switch'], [contenteditable]:not([contenteditable='false']), [tabindex]:not([tabindex='-1'])";
export function isMeshControl(target: EventTarget | null) { return target instanceof Element && !!target.closest(controls); }
type Ripple = { u: number; v: number; started: number };
type Bounds = { left: number; top: number; width: number; height: number };

export class MeshInteraction {
  pointer = { active: false, initialized: false, clientX: 0, clientY: 0, x: 0, y: 0, strength: 0 };
  readonly ripples: Ripple[] = [];
  private taps: { x: number; y: number }[] = [];
  private waves = new Float32Array(4 * 4);
  scale = 1;

  move(x: number, y: number) { this.pointer.active = true; this.pointer.clientX = x; this.pointer.clientY = y; }
  leave() { this.pointer.active = false; }
  tap(x: number, y: number) { if (this.taps.length === 4) this.taps.shift(); this.taps.push({ x, y }); }
  clear() {
    this.pointer.active = this.pointer.initialized = false;
    this.pointer.strength = 0;
    this.ripples.length = this.taps.length = 0;
  }

  // The only bounds read is here, at most once per rendered interaction frame.
  apply(points: Float32Array, width: number, height: number, time: number, delta: number, bounds: () => Bounds) {
    const pointer = this.pointer;
    while (this.ripples.length && time - this.ripples[0].started >= RIPPLE_DURATION) this.ripples.shift();
    if (!pointer.active && pointer.strength <= .001 && !this.ripples.length && !this.taps.length) {
      pointer.strength = 0; pointer.initialized = false; return;
    }
    const rect = bounds();
    if (!rect.width || !rect.height) return;
    this.scale = ((rect.width / width) + (rect.height / height)) / 2;
    const ease = 1 - Math.exp(-Math.min(delta, 64) / 90);
    pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * ease;
    if (pointer.active) {
      const x = (pointer.clientX - rect.left) * width / rect.width;
      const y = (pointer.clientY - rect.top) * height / rect.height;
      if (!pointer.initialized) { pointer.x = x; pointer.y = y; pointer.initialized = true; }
      pointer.x += (x - pointer.x) * ease; pointer.y += (y - pointer.y) * ease;
    }
    for (const tap of this.taps) {
      if (this.ripples.length === 4) this.ripples.shift();
      this.ripples.push({ u: (tap.x - rect.left) / rect.width, v: (tap.y - rect.top) / rect.height, started: time });
    }
    this.taps.length = 0;
    const radius = 180 / this.scale, hoverLimit = 20 / this.scale, band = 62 / this.scale;
    const extent = Math.hypot(width, height) * .72;
    this.ripples.forEach((ripple, i) => {
      const progress = (time - ripple.started) / RIPPLE_DURATION;
      this.waves[i * 4] = ripple.u * width; this.waves[i * 4 + 1] = ripple.v * height;
      this.waves[i * 4 + 2] = progress * extent;
      this.waves[i * 4 + 3] = Math.sin(progress * Math.PI) * 18 / this.scale;
    });
    for (let i = 0; i < points.length; i += 2) {
      let x = points[i], y = points[i + 1];
      if (pointer.strength > .001) {
        const dx = pointer.x - x, dy = pointer.y - y;
        // Cheap square rejection avoids hypot for most of the grid.
        if (Math.abs(dx) < radius && Math.abs(dy) < radius) {
          const distance = Math.hypot(dx, dy);
          if (distance > 0 && distance < radius) {
            const displacement = Math.min(distance * .45, hoverLimit * (1 - distance / radius) ** 2) * pointer.strength / distance;
            x += dx * displacement; y += dy * displacement;
          }
        }
      }
      for (let j = 0; j < this.ripples.length * 4; j += 4) {
        const dx = x - this.waves[j], dy = y - this.waves[j + 1];
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
          const displacement = Math.max(0, 1 - Math.abs(distance - this.waves[j + 2]) / band) * this.waves[j + 3] / distance;
          x += dx * displacement; y += dy * displacement;
        }
      }
      points[i] = x; points[i + 1] = y;
    }
  }
}
