import { observeAnimationLifecycle, type AnimationLifecycleState } from "@/lib/animationLifecycle";
import { drawTerrain, type FieldInput } from "./terrain";
import type { GlobeRenderer } from "./globe";

export function mountNotFoundScene(root: HTMLDivElement) {
  const globeCanvas = root.querySelector<HTMLCanvasElement>("[data-globe-canvas]")!;
  const terrainCanvas = root.querySelector<HTMLCanvasElement>("[data-terrain-canvas]")!;
  const globeHost = root.querySelector<HTMLElement>("[data-globe-host]")!;
  const globeButton = root.querySelector<HTMLButtonElement>("[data-globe-button]")!;
  const motionButton = root.querySelector<HTMLButtonElement>("[data-motion-button]")!;
  const motionLabel = root.querySelector<HTMLElement>("[data-motion-label]")!;
  const context = terrainCanvas.getContext("2d", { alpha: true });
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const forcedColors = matchMedia("(forced-colors: active)");
  const abort = new AbortController();
  const input: FieldInput = { x: 0, y: 0, strength: 0, ripples: [] };
  let globe: GlobeRenderer | undefined;
  let loading = false, failed = false, disposed = false, paused = false, lost = false;
  let state: AnimationLifecycleState | undefined;
  let frame = 0, last = 0, time = 0, frames = 0, pulseBorn = -10, samples = 0, frameAverage = 16;
  let x = 0, y = 0, targetX = 0, targetY = 0, targetStrength = 0;
  let terrainWidth = 1, terrainHeight = 1, low = innerWidth < 768, dirty = true;
  const running = () => !!state?.running && !paused && !forcedColors.matches && (!!context || !failed || !!globe);
  const visible = () => !!state?.inViewport && state.documentVisible;
  const resetInput = () => {
    x = y = targetX = targetY = targetStrength = 0;
    input.strength = 0; input.ripples = []; pulseBorn = -10;
    for (const property of ["--star-x", "--star-y", "--globe-x", "--globe-y", "--terrain-x", "--terrain-y"]) root.style.removeProperty(property);
  };
  const resize = () => {
    if (!visible()) { dirty = true; return; }
    const bounds = terrainCanvas.getBoundingClientRect();
    terrainWidth = Math.max(1, bounds.width); terrainHeight = Math.max(1, bounds.height);
    const ratio = Math.min(devicePixelRatio || 1, low ? 1 : 1.5);
    terrainCanvas.width = Math.round(terrainWidth * ratio); terrainCanvas.height = Math.round(terrainHeight * ratio);
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    const globeBounds = globeCanvas.getBoundingClientRect();
    globe?.resize(Math.max(1, globeBounds.width), Math.max(1, globeBounds.height), ratio);
    dirty = false;
  };
  const paint = () => {
    if (disposed || !visible() || forcedColors.matches || state?.reducedMotion) return;
    if (dirty) resize();
    if (context) {
      drawTerrain(context, terrainWidth, terrainHeight, time, input, low);
      root.dataset.terrainReady = "true";
    }
    if (globe && !lost) {
      globe.render(time, x, y, time - pulseBorn, low);
      root.dataset.globeReady = "true";
    }
    root.dataset.frames = String(++frames);
    root.dataset.ripples = String(input.ripples.length);
    root.dataset.quality = low ? "low" : "full";
  };
  const tick = (now: number) => {
    if (!running() || disposed) return;
    frame = requestAnimationFrame(tick);
    const elapsed = now - last;
    if (elapsed < (low ? 1000 / 30 : 1000 / 60) - 1) return;
    last = now;
    const delta = Math.min(elapsed / 1000, .05);
    time += delta;
    if (!low && ++samples > 90) {
      frameAverage = frameAverage * .95 + elapsed * .05;
      if (frameAverage > 27) { low = true; dirty = true; }
    }
    const blend = 1 - Math.exp(-delta / .16);
    x += (targetX - x) * blend; y += (targetY - y) * blend;
    input.strength += (targetStrength - input.strength) * blend;
    input.ripples = input.ripples.filter(ripple => time - ripple.born < 1);
    root.style.setProperty("--star-x", `${x * -4}px`); root.style.setProperty("--star-y", `${y * -4}px`);
    root.style.setProperty("--globe-x", `${x * 12}px`); root.style.setProperty("--globe-y", `${y * 12}px`);
    root.style.setProperty("--terrain-x", `${x * 20}px`); root.style.setProperty("--terrain-y", `${y * 20}px`);
    paint();
  };
  const loadGlobe = () => {
    if (loading || globe || failed || disposed || state?.reducedMotion || forcedColors.matches) return;
    loading = true;
    void import("./globe").then(({ createGlobe }) => {
      if (disposed) return;
      return createGlobe(globeCanvas, abort.signal);
    }).then(result => {
      loading = false;
      if (!result) return;
      if (disposed) { result.dispose(); return; }
      globe = result; dirty = true;
      globeButton.disabled = !running();
      paint();
    }).catch(() => {
      loading = false; failed = true;
      if (disposed) return;
      root.dataset.globeReady = "false"; globeButton.disabled = true;
      if (!context) synchronize();
    });
  };
  const synchronize = () => {
    cancelAnimationFrame(frame); frame = 0;
    resetInput();
    root.dataset.motion = running() ? "running" : "paused";
    motionButton.hidden = !!state?.reducedMotion || forcedColors.matches || (!context && failed);
    motionLabel.textContent = paused ? "Resume animation" : "Pause animation";
    motionButton.setAttribute("aria-label", motionLabel.textContent);
    motionButton.setAttribute("aria-pressed", String(paused));
    motionButton.querySelector("path")?.setAttribute("d", paused ? "m4 2 5 4-5 4Z" : "M4 2v8M8 2v8");
    globeButton.disabled = !running() || !globe || lost;
    if (state?.reducedMotion || forcedColors.matches) {
      root.dataset.globeReady = "false"; root.dataset.terrainReady = "false";
    } else if (visible()) {
      loadGlobe(); paint();
    }
    if (running()) { last = performance.now(); frame = requestAnimationFrame(tick); }
  };
  const lifecycle = observeAnimationLifecycle(root, next => { state = next; synchronize(); });
  const resizeObserver = new ResizeObserver(() => {
    dirty = true;
    if (innerWidth < 768) low = true;
    resetInput(); paint();
  });
  resizeObserver.observe(globeHost); resizeObserver.observe(terrainCanvas);
  const excluded = (target: EventTarget | null) => target instanceof Element && !!target.closest("a, button, input, textarea, select, summary, [role='button'], [contenteditable]");
  const onMove = (event: PointerEvent) => {
    if (!running() || !finePointer.matches || event.pointerType !== "mouse") return;
    const bounds = root.getBoundingClientRect();
    targetX = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    targetY = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    const field = terrainCanvas.getBoundingClientRect();
    input.x = event.clientX - field.left; input.y = event.clientY - field.top;
    targetStrength = excluded(event.target) ? 0 : 1;
  };
  const onLeave = () => { targetX = targetY = targetStrength = 0; input.ripples = []; };
  const onClick = (event: MouseEvent) => {
    if (!running() || !finePointer.matches || event.detail === 0 || event.button !== 0 || excluded(event.target) || event.defaultPrevented) return;
    const bounds = terrainCanvas.getBoundingClientRect();
    const px = event.clientX - bounds.left, py = event.clientY - bounds.top;
    if (px < 0 || px > terrainWidth || py < 0 || py > terrainHeight) return;
    input.ripples = [...input.ripples.slice(-2), { x: px, y: py, born: time }];
  };
  const sendSignal = (event: MouseEvent) => {
    if (!running() || !globe || lost) return;
    const bounds = globeCanvas.getBoundingClientRect();
    const sx = event.detail ? (event.clientX - bounds.left) / bounds.width * 2 - 1 : 0;
    const sy = event.detail ? -(event.clientY - bounds.top) / bounds.height * 2 + 1 : 0;
    globe.signal(sx, sy); pulseBorn = time;
    root.dataset.signals = String(Number(root.dataset.signals || 0) + 1);
  };
  const toggle = () => { paused = !paused; synchronize(); };
  const contextLost = (event: Event) => {
    event.preventDefault(); lost = true; root.dataset.globeReady = "false"; globeButton.disabled = true;
  };
  const contextRestored = () => { lost = false; dirty = true; synchronize(); };
  root.addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerleave", onLeave); root.addEventListener("pointercancel", onLeave); root.addEventListener("click", onClick);
  globeButton.addEventListener("click", sendSignal); motionButton.addEventListener("click", toggle);
  globeCanvas.addEventListener("webglcontextlost", contextLost); globeCanvas.addEventListener("webglcontextrestored", contextRestored);
  finePointer.addEventListener("change", synchronize); forcedColors.addEventListener("change", synchronize);
  return () => {
    disposed = true; abort.abort(); cancelAnimationFrame(frame); lifecycle.dispose(); resizeObserver.disconnect();
    root.removeEventListener("pointermove", onMove); root.removeEventListener("pointerleave", onLeave); root.removeEventListener("pointercancel", onLeave); root.removeEventListener("click", onClick);
    globeButton.removeEventListener("click", sendSignal); motionButton.removeEventListener("click", toggle);
    globeCanvas.removeEventListener("webglcontextlost", contextLost); globeCanvas.removeEventListener("webglcontextrestored", contextRestored);
    finePointer.removeEventListener("change", synchronize); forcedColors.removeEventListener("change", synchronize);
    globe?.dispose(); resetInput(); globeButton.disabled = true; motionButton.hidden = true;
    root.dataset.globeReady = "false"; root.dataset.terrainReady = "false"; root.dataset.motion = "paused";
  };
}
