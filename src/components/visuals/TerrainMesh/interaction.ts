import { MeshInteraction } from "../Mesh/interaction";

type Bounds = { left: number; top: number; width: number; height: number };
export class TerrainInteraction {
  // The shared pass applies local gathering first and click ripples second.
  readonly deformation = new MeshInteraction();
  private hover?: { x: number; y: number };
  private taps: { x: number; y: number }[] = [];
  move(x: number, y: number) { this.hover = { x, y }; }
  leave() { this.hover = undefined; this.deformation.leave(); }
  tap(x: number, y: number) { if (this.taps.length === 4) this.taps.shift(); this.taps.push({ x, y }); }
  clear() { this.leave(); this.taps.length = 0; this.deformation.clear(); }
  update(bounds: () => Bounds, viewport = { width: window.innerWidth, height: window.innerHeight }) {
    if (this.hover || this.taps.length) {
      const rect = bounds();
      const contains = (x: number, y: number) => rect.width > 0 && rect.height > 0 && x >= Math.max(0, rect.left) && x <= Math.min(viewport.width, rect.left + rect.width) && y >= Math.max(0, rect.top) && y <= Math.min(viewport.height, rect.top + rect.height);
      if (this.hover) {
        if (contains(this.hover.x, this.hover.y)) this.deformation.move(this.hover.x, this.hover.y);
        else this.deformation.leave();
      }
      for (const tap of this.taps) if (contains(tap.x, tap.y)) this.deformation.tap(tap.x, tap.y);
      this.taps.length = 0;
    }
  }
}
