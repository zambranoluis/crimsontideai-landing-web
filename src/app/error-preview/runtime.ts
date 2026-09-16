import { observeAnimationLifecycle, type AnimationLifecycleState } from "@/lib/animationLifecycle";

const KEYBOARD_STEP = Math.PI / 10;
const MAX_PARTICLES = 100;
const MAX_WISPS = 12;
const SHOULDER = { x: .52, y: .3 };

type Point = { x: number; y: number };
type Particle = { x: number; y: number; baseX: number; baseY: number; vx: number; vy: number; size: number; warm: boolean };
type Mask = { width: number; height: number; alpha: Uint8ClampedArray };
type SceneHit = "planet" | "terrain" | "astronaut" | "clouds" | "none";

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const mix = (from: number, to: number, strength: number) => from + (to - from) * strength;
const seeded = (index: number) => { const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453; return value - Math.floor(value); };

async function alphaMask(image: HTMLImageElement): Promise<Mask | undefined> {
  try {
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return undefined;
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const alpha = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let index = 0, pixel = 3; index < alpha.length; index += 1, pixel += 4) alpha[index] = pixels[pixel];
    return { width: canvas.width, height: canvas.height, alpha };
  } catch { return undefined; }
}

function sourcePoint(image: HTMLImageElement, mask: Mask, clientX: number, clientY: number) {
  const bounds = image.getBoundingClientRect();
  if (!bounds.width || !bounds.height || clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) return undefined;
  const [positionX = "50%", positionY = "50%"] = getComputedStyle(image).objectPosition.split(" ");
  const parsePosition = (value: string) => value.endsWith("%") ? Number.parseFloat(value) / 100 : .5;
  const scale = Math.max(bounds.width / mask.width, bounds.height / mask.height);
  const renderedWidth = mask.width * scale, renderedHeight = mask.height * scale;
  return { x: (clientX - bounds.left - (bounds.width - renderedWidth) * parsePosition(positionX)) / scale, y: (clientY - bounds.top - (bounds.height - renderedHeight) * parsePosition(positionY)) / scale };
}

export function mountErrorPreviewLight(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-error-light]");
  const controls = root.querySelector<HTMLButtonElement>("[data-error-light-controls]");
  const pause = root.querySelector<HTMLButtonElement>("[data-error-pause]");
  const planet = root.querySelector<HTMLImageElement>("[data-scene-layer='planet']");
  const terrain = root.querySelector<HTMLImageElement>("[data-scene-layer='terrain']");
  const astronaut = root.querySelector<HTMLImageElement>("[data-scene-layer='astronaut']");
  if (!canvas || !controls || !pause || !planet || !terrain || !astronaut) throw new Error("The error preview scene targets are unavailable.");
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) throw new Error("Canvas 2D is unavailable.");

  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  let state: AnimationLifecycleState | undefined;
  let size = { width: 1, height: 1, ratio: 1 };
  let target: Point = { x: .43, y: .54 }, pointer: Point = { x: .5, y: .5 }, direction = Math.PI;
  let frame = 0, last = 0, feedbackUntil = 0, burstCount = 0, slowFrames = 0, feedbackTimer = 0;
  let manualPaused = false, disposed = false, touch: { id: number; x: number; y: number; moved: boolean } | undefined, lastTouchActivation: Point | undefined;
  let masks: Partial<Record<Exclude<SceneHit, "clouds" | "none">, Mask>> = {};
  let current: SceneHit = "none", particleLimit = MAX_PARTICLES, wispLimit = MAX_WISPS;
  let particles: Particle[] = [];
  let parallax = { cloudX: 0, cloudY: 0, planetX: 0, planetY: 0, dustX: 0, dustY: 0, terrainX: 0, terrainY: 0, astronautX: 0, astronautY: 0, lean: 0 };
  let targetParallax = { ...parallax };

  const canAnimate = () => !!state?.running && !manualPaused && !disposed;
  const visible = () => !!state?.inViewport && state.documentVisible && !disposed;
  const reduced = () => !!state?.reducedMotion;
  const scenePoint = (clientX: number, clientY: number): Point | undefined => {
    const bounds = root.getBoundingClientRect();
    if (!bounds.width || !bounds.height || clientX < bounds.left || clientX > bounds.right || clientY < bounds.top || clientY > bounds.bottom) return undefined;
    return { x: clamp((clientX - bounds.left) / bounds.width, 0, 1), y: clamp((clientY - bounds.top) / bounds.height, 0, 1) };
  };
  const shoulder = (): Point => {
    const rootBounds = root.getBoundingClientRect(), bounds = astronaut.getBoundingClientRect();
    return { x: bounds.left - rootBounds.left + bounds.width * SHOULDER.x, y: bounds.top - rootBounds.top + bounds.height * SHOULDER.y };
  };
  const setTarget = (point: Point) => {
    target = { x: clamp(point.x, .04, .96), y: clamp(point.y, .06, .94) };
    const origin = shoulder(); direction = Math.atan2(target.y * size.height - origin.y, target.x * size.width - origin.x);
    root.dataset.lightDirection = "aimed"; root.dataset.lightX = target.x.toFixed(3); root.dataset.lightY = target.y.toFixed(3);
  };
  const writeParallax = () => {
    root.style.setProperty("--cloud-x", `${parallax.cloudX.toFixed(2)}px`); root.style.setProperty("--cloud-y", `${parallax.cloudY.toFixed(2)}px`);
    root.style.setProperty("--planet-x", `${parallax.planetX.toFixed(2)}px`); root.style.setProperty("--planet-y", `${parallax.planetY.toFixed(2)}px`);
    root.style.setProperty("--dust-x", `${parallax.dustX.toFixed(2)}px`); root.style.setProperty("--dust-y", `${parallax.dustY.toFixed(2)}px`);
    root.style.setProperty("--terrain-x", `${parallax.terrainX.toFixed(2)}px`); root.style.setProperty("--terrain-y", `${parallax.terrainY.toFixed(2)}px`);
    root.style.setProperty("--astronaut-x", `${parallax.astronautX.toFixed(2)}px`); root.style.setProperty("--astronaut-y", `${parallax.astronautY.toFixed(2)}px`); root.style.setProperty("--astronaut-lean", `${parallax.lean.toFixed(2)}deg`);
  };
  const resetParallax = () => { targetParallax = { cloudX: 0, cloudY: 0, planetX: 0, planetY: 0, dustX: 0, dustY: 0, terrainX: 0, terrainY: 0, astronautX: 0, astronautY: 0, lean: 0 }; };
  const createParticles = () => {
    particles = Array.from({ length: particleLimit }, (_, index) => {
      const spread = seeded(index * 3), depth = seeded(index * 3 + 1), ray = index % 4 === 0;
      const baseX = ray ? mix(.5, .7, spread) : spread, baseY = ray ? mix(.48, .78, depth) : mix(.61, .98, depth * depth);
      return { x: baseX, y: baseY, baseX, baseY, vx: 0, vy: 0, size: mix(.55, 1.7, seeded(index * 3 + 2)), warm: index % 3 === 0 };
    });
  };
  const hit = (clientX: number, clientY: number): SceneHit => {
    const targets: [Exclude<SceneHit, "clouds" | "none">, HTMLImageElement][] = [["astronaut", astronaut], ["terrain", terrain], ["planet", planet]];
    for (const [name, image] of targets) {
      const mask = masks[name]; if (!mask) continue;
      const point = sourcePoint(image, mask, clientX, clientY); if (!point) continue;
      const x = Math.floor(point.x), y = Math.floor(point.y);
      if (x >= 0 && x < mask.width && y >= 0 && y < mask.height && mask.alpha[y * mask.width + x] > 24) return name;
    }
    const point = scenePoint(clientX, clientY); return point && point.y < .64 ? "clouds" : "none";
  };
  const updateHover = (next: SceneHit) => { current = next; root.dataset.hover = next; };
  const drawBeam = (now: number) => {
    const origin = shoulder(), beamTarget = { x: target.x * size.width, y: target.y * size.height }, reach = Math.min(size.width, size.height) * .62, perpendicular = reach * .16;
    const end = { x: origin.x + Math.cos(direction) * reach, y: origin.y + Math.sin(direction) * reach }, side = { x: Math.cos(direction + Math.PI / 2) * perpendicular, y: Math.sin(direction + Math.PI / 2) * perpendicular };
    context.save(); context.globalCompositeOperation = "screen";
    const cone = context.createLinearGradient(origin.x, origin.y, end.x, end.y);
    cone.addColorStop(0, "rgb(255 90 72 / 25%)"); cone.addColorStop(.45, "rgb(243 59 57 / 10%)"); cone.addColorStop(1, "rgb(243 59 57 / 0%)");
    context.fillStyle = cone; context.beginPath(); context.moveTo(origin.x, origin.y); context.lineTo(end.x + side.x, end.y + side.y); context.lineTo(end.x - side.x, end.y - side.y); context.closePath(); context.fill();
    const haze = context.createRadialGradient(beamTarget.x, beamTarget.y, 0, beamTarget.x, beamTarget.y, Math.min(size.width, size.height) * (now < feedbackUntil ? .29 : .24));
    haze.addColorStop(0, "rgb(255 195 160 / 22%)"); haze.addColorStop(.4, "rgb(238 61 55 / 10%)"); haze.addColorStop(1, "rgb(238 61 55 / 0%)"); context.fillStyle = haze; context.fillRect(0, 0, size.width, size.height); context.restore();
  };
  const drawWisps = (now: number) => {
    if (reduced()) return;
    context.save(); context.globalCompositeOperation = "screen"; context.lineCap = "round";
    for (let index = 0; index < wispLimit; index += 1) {
      const phase = now / 9000 + index * .71, y = size.height * (.12 + (index % 5) * .08), x = ((phase * 30 + index * 167) % (size.width + 220)) - 110, swirl = current === "clouds" ? Math.sin((pointer.x + pointer.y + phase) * 7) * 9 : 0;
      context.strokeStyle = index % 3 ? "rgb(255 218 204 / 7%)" : "rgb(239 74 71 / 9%)"; context.lineWidth = index % 4 ? 1 : 1.5; context.beginPath(); context.moveTo(x - 85, y); context.bezierCurveTo(x - 20, y - 12 - swirl, x + 40, y + 13 + swirl, x + 125, y + Math.sin(phase) * 8); context.stroke();
    }
    context.restore();
  };
  const drawTerrainGlow = () => {
    if (current !== "terrain" && performance.now() >= feedbackUntil) return;
    const x = pointer.x * size.width, y = pointer.y * size.height, glow = context.createRadialGradient(x, y, 0, x, y, Math.min(size.width, size.height) * .13);
    glow.addColorStop(0, "rgb(255 169 137 / 18%)"); glow.addColorStop(1, "rgb(239 51 64 / 0%)"); context.save(); context.globalCompositeOperation = "screen"; context.fillStyle = glow; context.fillRect(0, 0, size.width, size.height); context.restore();
  };
  const drawParticles = () => { context.save(); context.globalCompositeOperation = "screen"; for (const particle of particles) { context.fillStyle = particle.warm ? "rgb(255 218 190 / 52%)" : "rgb(239 56 64 / 48%)"; context.beginPath(); context.arc(particle.x * size.width, particle.y * size.height, particle.size, 0, Math.PI * 2); context.fill(); } context.restore(); };
  const draw = (now: number) => {
    if (disposed || !visible()) return;
    const start = performance.now(); context.setTransform(size.ratio, 0, 0, size.ratio, 0, 0); context.clearRect(0, 0, size.width, size.height); drawWisps(now); drawTerrainGlow(); drawBeam(now); drawParticles();
    const duration = performance.now() - start; root.dataset.frameMs = duration.toFixed(2); slowFrames = duration > 16.7 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames >= 12 && particleLimit > 40) { particleLimit = Math.max(40, Math.floor(particleLimit * .7)); slowFrames = 0; createParticles(); root.dataset.particles = String(particleLimit); }
  };
  const burst = (point: Point) => {
    const now = performance.now(); feedbackUntil = now + 220; root.dataset.feedback = "true"; window.clearTimeout(feedbackTimer); feedbackTimer = window.setTimeout(() => { if (!disposed && performance.now() >= feedbackUntil) { root.dataset.feedback = "false"; draw(performance.now()); } }, 230);
    if (!reduced()) { burstCount += 1; for (const particle of particles) { const dx = particle.x - point.x, dy = particle.y - point.y, distance = Math.hypot(dx, dy); if (distance > .28) continue; const force = (.28 - distance) * 2.8; particle.vx += (dx / (distance || .01)) * force + (seeded(burstCount + particle.size) - .5) * .025; particle.vy += (dy / (distance || .01)) * force - .012; } root.dataset.bursts = String(burstCount); }
    draw(now);
  };
  const advance = (delta: number) => {
    const decay = 1 - Math.exp(-delta / .18);
    for (const key of Object.keys(parallax) as (keyof typeof parallax)[]) parallax[key] = mix(parallax[key], targetParallax[key], decay);
    writeParallax();
    for (const particle of particles) {
      if (current === "terrain" || current === "astronaut") { const dx = particle.x - pointer.x, dy = particle.y - pointer.y, distance = Math.hypot(dx, dy); if (distance < .14) { const force = (.14 - distance) * delta * .8; particle.vx += (dx / (distance || .01)) * force; particle.vy += (dy / (distance || .01)) * force; } }
      particle.vx += (particle.baseX - particle.x) * delta * .34; particle.vy += (particle.baseY - particle.y) * delta * .34; particle.vx *= Math.pow(.015, delta); particle.vy *= Math.pow(.015, delta); particle.x += particle.vx; particle.y += particle.vy;
    }
  };
  const tick = (now: number) => { if (!canAnimate()) return; frame = requestAnimationFrame(tick); const delta = Math.min((now - last) / 1000, .05); last = now; advance(delta); draw(now); };
  const synchronize = () => { cancelAnimationFrame(frame); frame = 0; root.dataset.motion = canAnimate() ? "running" : "paused"; root.dataset.reducedMotion = String(reduced()); if (reduced()) { resetParallax(); parallax = { ...targetParallax }; writeParallax(); } if (canAnimate()) { last = performance.now(); frame = requestAnimationFrame(tick); } else if (visible()) draw(performance.now()); };
  const resize = () => {
    const bounds = root.getBoundingClientRect(); size = { width: Math.max(1, Math.round(bounds.width)), height: Math.max(1, Math.round(bounds.height)), ratio: Math.min(window.devicePixelRatio || 1, 1.5) };
    canvas.width = Math.round(size.width * size.ratio); canvas.height = Math.round(size.height * size.ratio); canvas.style.width = `${size.width}px`; canvas.style.height = `${size.height}px`;
    particleLimit = bounds.width < 768 ? MAX_PARTICLES / 2 : MAX_PARTICLES; wispLimit = bounds.width < 768 ? MAX_WISPS / 2 : MAX_WISPS; createParticles(); root.dataset.particles = String(particleLimit); root.dataset.wisps = String(wispLimit); root.dataset.pixelRatio = String(size.ratio); draw(performance.now());
  };
  const aimAt = (clientX: number, clientY: number) => { const point = scenePoint(clientX, clientY); if (point) { pointer = point; setTarget(point); } return point; };
  const updatePointer = (clientX: number, clientY: number) => {
    const point = aimAt(clientX, clientY); if (!point) return; const horizontal = (point.x - .5) * 2, vertical = (point.y - .5) * 2;
    if (!reduced()) targetParallax = { cloudX: horizontal * 4, cloudY: vertical * 4, planetX: horizontal * 8, planetY: vertical * 8, dustX: horizontal * 12, dustY: vertical * 12, terrainX: horizontal * 16, terrainY: vertical * 16, astronautX: horizontal * 2.5, astronautY: vertical * 2, lean: horizontal * 1.15 };
    updateHover(hit(clientX, clientY));
  };
  const activate = (clientX: number, clientY: number, force = false) => { const point = aimAt(clientX, clientY); if (!point) return; const targetHit = hit(clientX, clientY); if (!force && targetHit === "none") return; updateHover(targetHit); burst(point); };
  const onPointerMove = (event: PointerEvent) => { if (event.pointerType === "mouse" && finePointer.matches) updatePointer(event.clientX, event.clientY); else if (event.pointerId === touch?.id && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 10) touch.moved = true; };
  const onPointerLeave = () => { updateHover("none"); resetParallax(); };
  const onPointerDown = (event: PointerEvent) => { if (event.pointerType === "touch" && event.isPrimary) touch = { id: event.pointerId, x: event.clientX, y: event.clientY, moved: false }; };
  const onPointerUp = (event: PointerEvent) => { if (event.pointerId !== touch?.id) return; const gesture = touch; touch = undefined; if (!gesture.moved) { activate(event.clientX, event.clientY); lastTouchActivation = { x: event.clientX, y: event.clientY }; } };
  const onClick = (event: MouseEvent) => { if (lastTouchActivation && Math.hypot(event.clientX - lastTouchActivation.x, event.clientY - lastTouchActivation.y) < 10) { lastTouchActivation = undefined; return; } if (event.detail !== 0 && event.button !== 0) return; activate(event.clientX, event.clientY, event.detail === 0); };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Home") { event.preventDefault(); setTarget({ x: .43, y: .54 }); root.dataset.lightDirection = "home"; draw(performance.now()); return; }
    if (event.key === "Enter" || event.key === " ") { event.preventDefault(); burst(target); return; }
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault(); direction += event.key === "ArrowLeft" || event.key === "ArrowUp" ? -KEYBOARD_STEP : KEYBOARD_STEP; const origin = shoulder(), reach = Math.min(size.width, size.height) * .44; setTarget({ x: (origin.x + Math.cos(direction) * reach) / size.width, y: (origin.y + Math.sin(direction) * reach) / size.height }); draw(performance.now());
  };
  const onPause = () => { manualPaused = !manualPaused; pause.setAttribute("aria-pressed", String(manualPaused)); pause.textContent = manualPaused ? "Resume animation" : "Pause animation"; if (manualPaused) resetParallax(); synchronize(); };
  const lifecycle = observeAnimationLifecycle(root, next => { state = next; synchronize(); }, { minVisibleRatio: .08 });
  const resizeObserver = new ResizeObserver(resize);
  void Promise.all([alphaMask(planet), alphaMask(terrain), alphaMask(astronaut)]).then(([planetMask, terrainMask, astronautMask]) => { if (disposed) return; masks = { planet: planetMask, terrain: terrainMask, astronaut: astronautMask }; root.dataset.masksReady = String(Boolean(planetMask && terrainMask && astronautMask)); });
  controls.disabled = false; pause.hidden = false; root.dataset.lightReady = "true";
  root.addEventListener("pointermove", onPointerMove, { passive: true }); root.addEventListener("pointerdown", onPointerDown, { passive: true }); root.addEventListener("pointerup", onPointerUp, { passive: true }); root.addEventListener("pointercancel", onPointerLeave, { passive: true }); root.addEventListener("pointerleave", onPointerLeave); root.addEventListener("click", onClick); controls.addEventListener("keydown", onKeyDown); pause.addEventListener("click", onPause); resizeObserver.observe(root); resize(); synchronize();
  return () => {
    disposed = true; cancelAnimationFrame(frame); window.clearTimeout(feedbackTimer); lifecycle.dispose(); resizeObserver.disconnect(); root.removeEventListener("pointermove", onPointerMove); root.removeEventListener("pointerdown", onPointerDown); root.removeEventListener("pointerup", onPointerUp); root.removeEventListener("pointercancel", onPointerLeave); root.removeEventListener("pointerleave", onPointerLeave); root.removeEventListener("click", onClick); controls.removeEventListener("keydown", onKeyDown); pause.removeEventListener("click", onPause); controls.disabled = true; pause.hidden = true; root.dataset.lightReady = "false"; root.dataset.motion = "paused"; root.dataset.hover = "none";
  };
}
