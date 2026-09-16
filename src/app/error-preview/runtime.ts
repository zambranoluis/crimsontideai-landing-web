const KEYBOARD_STEP = Math.PI / 10;

type Point = { x: number; y: number };

export function mountErrorPreviewLight(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-error-light]");
  const controls = root.querySelector<HTMLElement>("[data-error-light-controls]");
  if (!canvas || !controls) throw new Error("The error preview light targets are unavailable.");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas 2D is unavailable.");

  let size = { width: 1, height: 1, ratio: 1 };
  let target: Point = { x: .43, y: .54 };
  let direction = Math.PI;
  let active = document.visibilityState === "visible";
  let intersecting = true;
  let disposed = false;

  const shoulder = (): Point => ({ x: size.width * .684, y: size.height * .53 });
  const canDraw = () => active && intersecting && !disposed;
  const setMotion = () => { root.dataset.motion = canDraw() ? "running" : "paused"; };
  const setTarget = (point: Point) => {
    target = { x: Math.min(.96, Math.max(.04, point.x)), y: Math.min(.94, Math.max(.06, point.y)) };
    const origin = shoulder();
    direction = Math.atan2(target.y * size.height - origin.y, target.x * size.width - origin.x);
    root.dataset.lightDirection = "aimed";
    root.dataset.lightX = target.x.toFixed(3);
    root.dataset.lightY = target.y.toFixed(3);
  };
  const draw = () => {
    if (!canDraw()) return;
    const { width, height, ratio } = size;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    const origin = shoulder();
    const beamTarget = { x: target.x * width, y: target.y * height };

    context.save();
    context.globalCompositeOperation = "screen";
    const reach = Math.min(width, height) * .62;
    const perpendicular = reach * .16;
    const end = {
      x: origin.x + Math.cos(direction) * reach,
      y: origin.y + Math.sin(direction) * reach,
    };
    const side = { x: Math.cos(direction + Math.PI / 2) * perpendicular, y: Math.sin(direction + Math.PI / 2) * perpendicular };
    const cone = context.createLinearGradient(origin.x, origin.y, end.x, end.y);
    cone.addColorStop(0, "rgb(255 80 65 / 20%)");
    cone.addColorStop(.45, "rgb(243 59 57 / 9%)");
    cone.addColorStop(1, "rgb(243 59 57 / 0%)");
    context.fillStyle = cone;
    context.beginPath();
    context.moveTo(origin.x, origin.y);
    context.lineTo(end.x + side.x, end.y + side.y);
    context.lineTo(end.x - side.x, end.y - side.y);
    context.closePath();
    context.fill();

    const dust = context.createRadialGradient(beamTarget.x, beamTarget.y, 0, beamTarget.x, beamTarget.y, Math.min(width, height) * .24);
    dust.addColorStop(0, "rgb(255 188 156 / 20%)");
    dust.addColorStop(.38, "rgb(238 61 55 / 10%)");
    dust.addColorStop(1, "rgb(238 61 55 / 0%)");
    context.fillStyle = dust;
    context.fillRect(0, 0, width, height);

    context.restore();
  };
  const resize = () => {
    const bounds = root.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    size = { width, height, ratio };
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    draw();
  };
  const aim = (event: PointerEvent) => {
    const bounds = root.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    setTarget({ x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height });
    draw();
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "mouse" && !(event.target instanceof Element && event.target.closest("[data-error-light-controls]"))) aim(event);
  };
  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === "touch" && !(event.target instanceof Element && event.target.closest("[data-error-light-controls]"))) aim(event);
  };
  const onClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("[data-error-light-controls]")) return;
    const bounds = root.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    setTarget({ x: (event.clientX - bounds.left) / bounds.width, y: (event.clientY - bounds.top) / bounds.height });
    draw();
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (!controls.contains(event.target as Node)) return;
    if (event.key === "Home") {
      event.preventDefault();
      setTarget({ x: .43, y: .54 });
      root.dataset.lightDirection = "home";
      draw();
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      return;
    }
    if (!event.key.startsWith("Arrow")) return;
    event.preventDefault();
    direction += event.key === "ArrowLeft" || event.key === "ArrowUp" ? -KEYBOARD_STEP : KEYBOARD_STEP;
    const origin = shoulder();
    const reach = Math.min(size.width, size.height) * .44;
    setTarget({ x: (origin.x + Math.cos(direction) * reach) / size.width, y: (origin.y + Math.sin(direction) * reach) / size.height });
    draw();
  };
  const onVisibility = () => {
    active = document.visibilityState === "visible";
    setMotion();
    if (canDraw()) draw();
  };
  const observer = new IntersectionObserver(entries => {
    intersecting = entries[0]?.isIntersecting ?? false;
    setMotion();
    if (canDraw()) draw();
  }, { threshold: .08 });
  const resizeObserver = new ResizeObserver(resize);

  controls.tabIndex = 0;
  controls.setAttribute("aria-disabled", "false");
  root.dataset.lightReady = "true";
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerdown", onPointerDown, { passive: true });
  root.addEventListener("click", onClick);
  controls.addEventListener("keydown", onKeyDown);
  document.addEventListener("visibilitychange", onVisibility);
  resizeObserver.observe(root);
  observer.observe(root);
  resize();
  setMotion();

  return () => {
    disposed = true;
    observer.disconnect();
    resizeObserver.disconnect();
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("click", onClick);
    controls.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("visibilitychange", onVisibility);
    controls.tabIndex = -1;
    controls.setAttribute("aria-disabled", "true");
    root.dataset.lightReady = "false";
    root.dataset.motion = "paused";
  };
}
