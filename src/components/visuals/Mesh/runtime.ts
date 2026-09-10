import { MeshInteraction, isMeshControl } from "./interaction";
import type { MeshVariant } from "./presets";
import { AdaptiveQuality, FrameCadence } from "./quality";
import { MeshRenderer } from "./renderer";
import { meshScheduler } from "./scheduler";
import { subscribeScrollFrame } from "@/lib/scrollFrame";

export function mountMesh(canvas: HTMLCanvasElement, variant: MeshVariant) {
  const section = canvas.closest("section");
  if (!section) return;
  let context: CanvasRenderingContext2D | null;
  try { context = canvas.getContext("2d"); } catch { return; }
  if (!context) return;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  const mobile = matchMedia("(max-width: 767px), (pointer: coarse)");
  const quality = new AdaptiveQuality(mobile.matches ? 1 : 0);
  const cadence = new FrameCadence();
  const interaction = new MeshInteraction();
  const renderer = new MeshRenderer(canvas, context, variant, quality.tier);
  let visible = false, failed = false, dirty = true;
  let elapsed = 0;
  let width = 0, height = 0;
  let resized = true;
  let view: DOMRectReadOnly | undefined;
  let viewDirty = true;
  const canAnimate = () => visible && !reduced.matches && !failed && width > 0 && height > 0;
  const running = () => canAnimate() && !document.hidden;
  const suspend = () => {
    interaction.clear(); cadence.reset(); quality.resetWindow(); dirty = true;
    canvas.dataset.running = String(running());
    // A reduced-motion mesh has no scheduled frame to apply a hidden-tab resize.
    if (reduced.matches && visible && !document.hidden && !failed && width && height && resized) draw(0, 0);
  };
  const fail = () => {
    failed = true; delete canvas.dataset.ready; canvas.style.visibility = "hidden";
    subscription.setActive(false); canvas.dataset.running = "false";
  };
  const draw = (delta: number, gap: number) => {
    try {
      if (resized) { renderer.resize(width, height, quality.tier); resized = false; }
      let frameBounds: DOMRectReadOnly | undefined;
      const bounds = () => frameBounds ??= canvas.getBoundingClientRect();
      if (viewDirty || !view) { view = bounds(); viewDirty = false; }
      const start = performance.now();
      renderer.draw(reduced.matches ? 0 : elapsed, delta, interaction, bounds, view);
      if (frameBounds) view = frameBounds;
      const cost = performance.now() - start;
      dirty = false;
      if (!reduced.matches && gap && quality.sample(cost, gap)) { resized = true; cadence.reset(); }
    } catch { fail(); }
  };
  const subscription = meshScheduler().subscribe(delta => {
    elapsed += delta;
    const gap = cadence.advance(delta, quality.fps);
    if (dirty || gap) draw(gap || 1000 / quality.fps, gap);
  }, suspend);
  const synchronize = () => {
    // The scheduler owns tab visibility. Keep eligible subscriptions active through
    // hidden-tab resize/media events so its visibility handler can resume them.
    subscription.setActive(canAnimate()); canvas.dataset.running = String(running());
    if (reduced.matches) {
      interaction.clear();
      if (visible && !document.hidden && !failed && width && height) draw(0, 0);
    }
  };
  const resize = new ResizeObserver(([entry]) => {
    // Layout dimensions, not the hero's transformed visual bounds.
    width = entry.contentRect.width; height = entry.contentRect.height;
    resized = dirty = viewDirty = true; synchronize();
  });
  const intersection = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; view = entry.boundingClientRect; viewDirty = false; synchronize(); });
  // Reuse the page's existing event-driven scroll/resize scheduler. No bounds reads
  // in input handlers, and the next mesh draw shares its measurement with interaction.
  const stopViewport = subscribeScrollFrame(() => {
    viewDirty = true;
    if (reduced.matches && visible && !document.hidden) { dirty = true; synchronize(); }
  });
  const move = (event: PointerEvent) => {
    if (!running() || !fine.matches || event.pointerType === "touch" || isMeshControl(event.target)) { interaction.leave(); return; }
    interaction.move(event.clientX, event.clientY);
  };
  const leave = () => interaction.leave();
  const click = (event: MouseEvent) => {
    if (!running() || event.detail === 0 || event.button !== 0 || isMeshControl(event.target)) return;
    interaction.tap(event.clientX, event.clientY);
  };
  const restore = () => { failed = false; canvas.style.visibility = ""; resized = dirty = true; synchronize(); };
  const resolution = () => { resized = dirty = true; synchronize(); };
  resize.observe(canvas); intersection.observe(canvas);
  reduced.addEventListener("change", synchronize); fine.addEventListener("change", leave);
  window.addEventListener("resize", resolution, { passive: true });
  section.addEventListener("pointermove", move, { passive: true });
  section.addEventListener("pointerleave", leave, { passive: true });
  section.addEventListener("pointercancel", leave, { passive: true });
  section.addEventListener("click", click, { passive: true });
  canvas.addEventListener("contextlost", fail); canvas.addEventListener("contextrestored", restore);
  return () => {
    subscription.dispose(); stopViewport(); interaction.clear(); resize.disconnect(); intersection.disconnect();
    reduced.removeEventListener("change", synchronize); fine.removeEventListener("change", leave);
    window.removeEventListener("resize", resolution);
    section.removeEventListener("pointermove", move); section.removeEventListener("pointerleave", leave);
    section.removeEventListener("pointercancel", leave); section.removeEventListener("click", click);
    canvas.removeEventListener("contextlost", fail); canvas.removeEventListener("contextrestored", restore);
    delete canvas.dataset.ready; canvas.dataset.running = "false";
  };
}
