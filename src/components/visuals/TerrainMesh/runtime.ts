import { isMeshControl } from "../Mesh/interaction";
import { AdaptiveQuality, FrameCadence } from "../Mesh/quality";
import { meshScheduler } from "../Mesh/scheduler";
import { TerrainInteraction } from "./interaction";
import { TerrainRenderer } from "./renderer";

export function mountTerrainMesh(canvas: HTMLCanvasElement, hostSelector: string) {
  const host = canvas.closest<HTMLElement>(hostSelector);
  if (!host) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const mobile = matchMedia("(max-width: 767px), (pointer: coarse)");
  const quality = new AdaptiveQuality(mobile.matches ? 1 : 0), cadence = new FrameCadence();
  const interaction = new TerrainInteraction();
  let renderer: TerrainRenderer | undefined;
  let visible = false, failed = false, resized = true, dirty = true;
  let width = 0, height = 0, elapsed = 0;
  const eligible = () => visible && !reduced.matches && !failed && width > 0 && height > 0;
  const running = () => eligible() && !document.hidden;
  const fallback = () => { delete canvas.dataset.ready; canvas.style.visibility = "hidden"; };
  const suspend = () => {
    interaction.clear(); cadence.reset(); quality.resetWindow(); dirty = true;
    canvas.dataset.running = String(running());
  };
  const fail = (event?: Event) => {
    event?.preventDefault(); failed = true; renderer = undefined; fallback();
    subscription.setActive(false); canvas.dataset.running = "false";
  };
  const subscription = meshScheduler().subscribe(delta => {
    elapsed += delta;
    const gap = cadence.advance(delta, quality.fps);
    if (!dirty && !gap) return;
    try {
      if (!renderer) {
        // Retain the export's low-latency context hint. Synchronized presentation
        // caused severe raster stalls in the throttled production comparison.
        const context = canvas.getContext("2d", { alpha: true, desynchronized: true });
        if (!context) { fail(); return; }
        renderer = new TerrainRenderer(canvas, context); resized = true;
      }
      const start = performance.now();
      if (resized) { renderer.resize(width, height, quality.tier); resized = false; }
      let rect: DOMRectReadOnly | undefined;
      renderer.draw(elapsed, gap, interaction, () => rect ??= canvas.getBoundingClientRect());
      const cost = performance.now() - start;
      // These affect :has() and SVG visibility. Rewriting even equal values on
      // every draw causes expensive style work outside the canvas timing span.
      if (canvas.dataset.ready !== "true") {
        canvas.dataset.ready = "true"; canvas.style.visibility = "";
      }
      dirty = false;
      if (gap && quality.sample(cost, gap)) { resized = true; cadence.reset(); }
    } catch { fail(); }
  }, suspend);
  const synchronize = () => {
    // Scheduler owns visibility; hidden-tab resize must retain eligibility.
    subscription.setActive(eligible()); canvas.dataset.running = String(running());
    if (reduced.matches) { interaction.clear(); fallback(); }
  };
  const resize = new ResizeObserver(([entry]) => {
    width = entry.contentRect.width; height = entry.contentRect.height;
    resized = dirty = true; synchronize();
  });
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; synchronize(); });
  const move = (event: PointerEvent) => {
    if (!running() || !fine.matches || event.pointerType === "touch" || isMeshControl(event.target)) { interaction.leave(); return; }
    interaction.move(event.clientX, event.clientY);
  };
  const leave = () => interaction.leave();
  const click = (event: MouseEvent) => {
    if (!running() || event.detail === 0 || event.button !== 0 || isMeshControl(event.target)) return;
    interaction.tap(event.clientX, event.clientY);
  };
  const restore = () => { failed = false; resized = dirty = true; synchronize(); };
  const resolution = () => { resized = dirty = true; synchronize(); };
  resize.observe(canvas); intersection.observe(canvas);
  reduced.addEventListener("change", synchronize); fine.addEventListener("change", leave);
  window.addEventListener("resize", resolution, { passive: true });
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerleave", leave, { passive: true });
  host.addEventListener("pointercancel", leave, { passive: true });
  host.addEventListener("click", click, { passive: true });
  canvas.addEventListener("contextlost", fail); canvas.addEventListener("contextrestored", restore);
  synchronize();
  return () => {
    subscription.dispose(); interaction.clear(); renderer = undefined; resize.disconnect(); intersection.disconnect();
    reduced.removeEventListener("change", synchronize); fine.removeEventListener("change", leave);
    window.removeEventListener("resize", resolution);
    host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave);
    host.removeEventListener("pointercancel", leave); host.removeEventListener("click", click);
    canvas.removeEventListener("contextlost", fail); canvas.removeEventListener("contextrestored", restore);
    fallback(); canvas.dataset.running = "false";
  };
}
