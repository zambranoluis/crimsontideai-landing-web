import { MeshInteraction } from "../Mesh/interaction";
import { clamp, type TerrainPointer } from "./geometry";
import { footerTerrainPreset as p } from "./preset";

type Bounds = { left: number; top: number; width: number; height: number };
export class TerrainInteraction {
  readonly pointer: TerrainPointer = { inside: false, x: .72, y: .63, sx: 0, sy: 0 };
  // Reuse only the first mesh's ripple; terrain has its own whole-field hover.
  readonly ripple = new MeshInteraction();
  private hover?: { x: number; y: number };
  private taps: { x: number; y: number }[] = [];
  move(x: number, y: number) { this.hover = { x, y }; }
  leave() { this.hover = undefined; this.pointer.inside = false; }
  tap(x: number, y: number) { if (this.taps.length === 4) this.taps.shift(); this.taps.push({ x, y }); }
  clear() { this.leave(); this.pointer.sx = this.pointer.sy = 0; this.taps.length = 0; this.ripple.clear(); }
  update(delta: number, bounds: () => Bounds, viewport = { width: window.innerWidth, height: window.innerHeight }) {
    if (this.hover || this.taps.length) {
      const rect = bounds();
      const contains = (x: number, y: number) => rect.width > 0 && rect.height > 0 && x >= Math.max(0, rect.left) && x <= Math.min(viewport.width, rect.left + rect.width) && y >= Math.max(0, rect.top) && y <= Math.min(viewport.height, rect.top + rect.height);
      this.pointer.inside = !!this.hover && contains(this.hover.x, this.hover.y);
      if (this.hover && this.pointer.inside) {
        this.pointer.x = clamp((this.hover.x - rect.left) / rect.width);
        this.pointer.y = clamp((this.hover.y - rect.top) / rect.height);
      }
      for (const tap of this.taps) if (contains(tap.x, tap.y)) this.ripple.tap(tap.x, tap.y);
      this.taps.length = 0;
    }
    const factor = 1 - (1 - p.mouseSmoothing) ** (delta * .06);
    const tx = this.pointer.inside ? (this.pointer.x - .5) * 2 : 0;
    const ty = this.pointer.inside ? (this.pointer.y - .5) * 2 : 0;
    this.pointer.sx += (tx - this.pointer.sx) * factor;
    this.pointer.sy += (ty - this.pointer.sy) * factor;
  }
}
