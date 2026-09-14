import { observeAnimationLifecycle, type AnimationLifecycleState } from "@/lib/animationLifecycle";
import { drawTerrain, type FieldInput } from "./terrain";
import type { GlobeRenderer } from "./globe";

export function mountNotFoundScene(root: HTMLDivElement) {
  const globeCanvas = root.querySelector<HTMLCanvasElement>("[data-globe-canvas]")!;
  const terrainCanvas = root.querySelector<HTMLCanvasElement>("[data-terrain-canvas]")!;
  const globeHost = root.querySelector<HTMLElement>("[data-globe-host]")!;
  const globeButton = root.querySelector<HTMLButtonElement>("[data-globe-button]")!;
  const context = terrainCanvas.getContext("2d", { alpha: true });
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const forcedColors = matchMedia("(forced-colors: active)");
  const abort = new AbortController();
  const input: FieldInput = { x: 0, y: 0, strength: 0, ripples: [] };
  let globe: GlobeRenderer | undefined;
  let loading = false, failed = false, disposed = false, lost = false;
  let state: AnimationLifecycleState | undefined;
  let frame = 0, last = 0, time = 0, frames = 0, pulseBorn = -10;
  let x = 0, y = 0, targetX = 0, targetY = 0, targetStrength = 0;
  let terrainWidth = 1, terrainHeight = 1, dirty = true;
  const running = () => !!state?.running && !forcedColors.matches && (!!context || !failed || !!globe);
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
    const ratio = 1;
    const width = Math.round(terrainWidth * ratio), height = Math.round(terrainHeight * ratio);
    if (terrainCanvas.width !== width) terrainCanvas.width = width;
    if (terrainCanvas.height !== height) terrainCanvas.height = height;
    context?.setTransform(ratio, 0, 0, ratio, 0, 0);
    const globeBounds = globeCanvas.getBoundingClientRect();
    globe?.resize(Math.max(1, globeBounds.width), Math.max(1, globeBounds.height), ratio);
    dirty = false;
  };
  const paint = () => {
    if (disposed || !visible() || forcedColors.matches || state?.reducedMotion) return;
    if (dirty) resize();
    if (context) {
      drawTerrain(context, terrainWidth, terrainHeight, time, input);
      root.dataset.terrainReady = "true";
    }
    if (globe && !lost) {
      globe.render(time, x, y, time - pulseBorn);
      root.dataset.globeReady = "true";
      root.dataset.orientation = JSON.stringify(globe.orientation());
    }
    root.dataset.frames = String(++frames);
    root.dataset.ripples = String(input.ripples.length);
    root.dataset.quality = "low";
    root.dataset.time = String(time);
  };
  const tick = (now: number) => {
    if (!running() || disposed) return;
    frame = requestAnimationFrame(tick);
    const elapsed = now - last;
    if (elapsed < (1000 / 30) - 1) return;
    last = now;
    const delta = Math.min(elapsed / 1000, .05);
    time += delta;
    if (!drag) globe?.spin(delta);
    const blend = 1 - Math.exp(-delta / .16);
    x += (targetX - x) * blend; y += (targetY - y) * blend;
    input.strength += (targetStrength - input.strength) * blend;
    input.ripples = input.ripples.filter(ripple => time - ripple.born < 1);
    root.style.setProperty("--star-x", `${x * -4}px`); root.style.setProperty("--star-y", `${y * -4}px`);
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
      setGlobeButton();
      paint();
    }).catch(() => {
      loading = false; failed = true;
      if (disposed) return;
      root.dataset.globeReady = "false"; globeButton.disabled = true;
      if (!context) synchronize();
    });
  };
  const setGlobeButton = () => { globeButton.disabled = !running() || !globe || lost; };
  let drag: { id: number; startX: number; startY: number; x: number; y: number; moved: boolean; bounds: DOMRect } | undefined;
  let suppressedClick: { x: number; y: number } | undefined;
  const cancelDrag = () => {
    if (!drag) return;
    const id = drag.id;
    drag = undefined;
    root.dataset.dragging = "false";
    if (globeButton.hasPointerCapture(id)) globeButton.releasePointerCapture(id);
  };
  const synchronize = () => {
    cancelAnimationFrame(frame); frame = 0;
    if (!running()) { cancelDrag(); resetInput(); }
    root.dataset.motion = running() ? "running" : "paused";
    setGlobeButton();
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
    cancelDrag(); paint();
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
  const sendSignalAt = (clientX: number, clientY: number, fromPointer: boolean) => {
    if (!running() || !globe || lost) return;
    const bounds = globeCanvas.getBoundingClientRect();
    const sx = fromPointer ? (clientX - bounds.left) / bounds.width * 2 - 1 : 0;
    const sy = fromPointer ? -(clientY - bounds.top) / bounds.height * 2 + 1 : 0;
    globe.signal(sx, sy); pulseBorn = time;
    root.dataset.signals = String(Number(root.dataset.signals || 0) + 1);
  };
  const sendSignal = (event: MouseEvent) => {
    if (event.detail !== 0 && suppressedClick && Math.hypot(event.clientX - suppressedClick.x, event.clientY - suppressedClick.y) < 6) {
      suppressedClick = undefined; return;
    }
    suppressedClick = undefined;
    sendSignalAt(event.clientX, event.clientY, event.detail !== 0);
  };
  const onDown = (event: PointerEvent) => {
    if (!running() || !globe || lost || !event.isPrimary || event.button !== 0 || drag) return;
    suppressedClick = undefined;
    if (event.pointerType === "touch") root.dataset.touch = "true";
    drag = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: event.clientX, y: event.clientY, moved: false, bounds: globeButton.getBoundingClientRect() };
    globeButton.setPointerCapture(event.pointerId);
  };
  const onDrag = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id || !globe) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    drag.moved = true;
    root.dataset.dragging = "true";
    const { bounds } = drag;
    const radius = Math.min(bounds.width, bounds.height) / 2;
    const cx = bounds.left + bounds.width / 2, cy = bounds.top + bounds.height / 2;
    globe.drag((drag.x - cx) / radius, (cy - drag.y) / radius, (event.clientX - cx) / radius, (cy - event.clientY) / radius);
    drag.x = event.clientX; drag.y = event.clientY;
  };
  const onUp = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    onDrag(event);
    const moved = drag.moved;
    cancelDrag();
    if (moved) suppressedClick = { x: event.clientX, y: event.clientY };
    else {
      sendSignalAt(event.clientX, event.clientY, true);
      suppressedClick = { x: event.clientX, y: event.clientY };
    }
  };
  const onCancel = (event: PointerEvent) => { if (event.pointerId === drag?.id) cancelDrag(); };
  const onKey = (event: KeyboardEvent) => {
    const direction = ({ ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", Home: "reset" } as Record<string, string>)[event.key];
    if (!direction || !running() || !globe || lost) return;
    event.preventDefault(); cancelDrag(); globe.rotate(direction); paint();
  };
  const contextLost = (event: Event) => {
    event.preventDefault(); lost = true; cancelDrag(); root.dataset.globeReady = "false"; setGlobeButton();
  };
  const contextRestored = () => { lost = false; dirty = true; synchronize(); };
  root.addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerleave", onLeave); root.addEventListener("pointercancel", onLeave); root.addEventListener("click", onClick);
  globeButton.addEventListener("click", sendSignal);
  globeButton.addEventListener("pointerdown", onDown);
  globeButton.addEventListener("pointermove", onDrag);
  globeButton.addEventListener("pointerup", onUp);
  globeButton.addEventListener("pointercancel", onCancel);
  globeButton.addEventListener("lostpointercapture", onCancel);
  globeButton.addEventListener("keydown", onKey);
  globeCanvas.addEventListener("webglcontextlost", contextLost); globeCanvas.addEventListener("webglcontextrestored", contextRestored);
  finePointer.addEventListener("change", synchronize); forcedColors.addEventListener("change", synchronize);
  return () => {
    cancelDrag(); disposed = true; abort.abort(); cancelAnimationFrame(frame); lifecycle.dispose(); resizeObserver.disconnect();
    root.removeEventListener("pointermove", onMove); root.removeEventListener("pointerleave", onLeave); root.removeEventListener("pointercancel", onLeave); root.removeEventListener("click", onClick);
    globeButton.removeEventListener("click", sendSignal);
    globeButton.removeEventListener("pointerdown", onDown);
    globeButton.removeEventListener("pointermove", onDrag);
    globeButton.removeEventListener("pointerup", onUp);
    globeButton.removeEventListener("pointercancel", onCancel);
    globeButton.removeEventListener("lostpointercapture", onCancel);
    globeButton.removeEventListener("keydown", onKey);
    globeCanvas.removeEventListener("webglcontextlost", contextLost); globeCanvas.removeEventListener("webglcontextrestored", contextRestored);
    finePointer.removeEventListener("change", synchronize); forcedColors.removeEventListener("change", synchronize);
    globe?.dispose(); resetInput(); globeButton.disabled = true;
    root.dataset.globeReady = "false"; root.dataset.terrainReady = "false"; root.dataset.motion = "paused";
  };
}
