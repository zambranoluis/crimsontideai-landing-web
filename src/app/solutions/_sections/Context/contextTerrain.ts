import { observeAnimationLifecycle, type AnimationLifecycleState } from "@/lib/animationLifecycle";

export const CONTEXT_MESH = {
  columns: 36,
  rows: 18,
  pulseDuration: 900,
  maxPulses: 3,
} as const;

type Point = {
  x: number;
  y: number;
  x01: number;
  z: number;
  terrain: number;
};

type PointerState = {
  x: number;
  y: number;
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  inside: boolean;
};

export type ContextPulse = {
  x: number;
  y: number;
  startedAt: number;
};

type ContextMeshOptions = {
  width: number;
  height: number;
  seconds: number;
  pointer?: Partial<Pick<PointerState, "x" | "y" | "sx" | "sy" | "inside">>;
};

const PARAMS = {
  primaryColor: { r: 215, g: 25, b: 63 },
  highlightColor: { r: 255, g: 54, b: 89 },
  opacity: .95,
  glow: 1.25,
  pointSize: 1.12,
  lineOpacity: .07,
  lineWidth: .58,
  waveHeight: 1.6,
  waveFreqX: 8,
  waveFreqY: 8.2,
  detail: .13,
  ridge1Height: .92,
  ridge1X: .16,
  ridge1Y: .48,
  ridge1Width: 1,
  ridge1Depth: 1.15,
  ridge2Height: 1.08,
  ridge2X: .6,
  ridge2Y: .47,
  ridge2Width: .72,
  ridge2Depth: 1.56,
  upperRelief: .44,
  perspective: .66,
  topSpread: .25,
  verticalScale: .95,
  horizon: .19,
  tilt: .01,
  directionAngle: -2,
  perspectiveDirection: 0,
  scale: .45,
  meshWidth: .57,
  meshLength: .37,
  offsetX: -.03,
  offsetY: .045,
  speed: .86,
  waveDrift: 1.17,
  crestHeight: 1.32,
  crestTravel: .22,
  crestSpeed: .72,
  crestWidth: .018,
  crestSpread: .24,
  shimmer: .56,
  shimmerSpeed: 2.35,
  pulseCount: 3,
  pulseSpeed: 1.15,
  pulseWidth: .026,
  pulseIntensity: .64,
  ambientGlow: .62,
  parallax: .56,
  mouseForce: .32,
  mouseRadius: .18,
  mouseSmoothing: .045,
  dprCap: 1.75,
} as const;

const clamp = (value: number, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const lerp = (start: number, end: number, progress: number) => start + (end - start) * progress;

function createGrid() {
  return Array.from({ length: CONTEXT_MESH.rows }, () => Array.from({ length: CONTEXT_MESH.columns }, (): Point => ({
    x: 0,
    y: 0,
    x01: 0,
    z: 0,
    terrain: 0,
  })));
}

function waveDepthAmplitude(nx: number, z: number, time: number) {
  const depth = clamp((z - .2) / .8);
  const blendDepth = depth * depth * (3 - 2 * depth);
  const upperAmplitude = 1 + .2 * Math.sin(time * .7 + nx * 2.4);
  return lerp(upperAmplitude, .65, blendDepth);
}

function travelingCrestDepth(time: number) {
  return .5 + Math.sin(time * PARAMS.waveDrift * PARAMS.crestSpeed) * PARAMS.crestTravel;
}

function terrainHeight(nx: number, z: number, time: number, pointer: PointerState) {
  const waveTime = time * PARAMS.waveDrift;
  const broad = Math.sin(nx * PARAMS.waveFreqX + waveTime * .9) * .44
    + Math.cos(z * PARAMS.waveFreqY - waveTime * .68) * .28;
  const detail = (
    Math.sin((nx + z * .65) * (13.5 + PARAMS.detail * 1.2) + waveTime * .56) * .16
    + Math.cos(nx * (19 + PARAMS.detail * 3) - z * 8.5 + waveTime * .23) * .1
    + Math.sin(nx * 31 + z * 17 - waveTime * .18) * .045
  ) * PARAMS.detail;
  const x01 = nx * .5 + .5;
  const ridge1 = Math.exp(-(
    ((x01 - PARAMS.ridge1X) ** 2) / (.032 * PARAMS.ridge1Width ** 2)
    + ((z - PARAMS.ridge1Y) ** 2) / (.07 * PARAMS.ridge1Depth ** 2)
  )) * PARAMS.ridge1Height;
  const ridge2 = Math.exp(-(
    ((x01 - PARAMS.ridge2X) ** 2) / (.026 * PARAMS.ridge2Width ** 2)
    + ((z - PARAMS.ridge2Y) ** 2) / (.085 * PARAMS.ridge2Depth ** 2)
  )) * PARAMS.ridge2Height;
  const crestDepth = travelingCrestDepth(time);
  const travelingCrest = Math.exp(-(
    (nx ** 2) / PARAMS.crestSpread
    + ((z - crestDepth) ** 2) / PARAMS.crestWidth
  )) * PARAMS.crestHeight;
  let mouse = 0;
  if (pointer.inside) {
    const dx = x01 - pointer.x;
    const dz = z - clamp((pointer.y - .24) / .76);
    mouse = Math.exp(-(dx * dx + dz * dz) / (PARAMS.mouseRadius ** 2))
      * PARAMS.mouseForce
      * (.54 + Math.sin(time * 1.8 + x01 * 7) * .08);
  }
  return (broad + detail + ridge1 + ridge2 + travelingCrest + mouse)
    * PARAMS.waveHeight
    * waveDepthAmplitude(nx, z, time);
}

function projectPoint(column: number, row: number, time: number, pointer: PointerState, point: Point) {
  // The mock projects in this fixed authoring space before fitting to the live circle.
  const sourceWidth = 1000;
  const sourceHeight = 700;
  const x01 = column / (CONTEXT_MESH.columns - 1);
  const z = row / (CONTEXT_MESH.rows - 1);
  const nx = (x01 - .5) * 2;
  const terrain = terrainHeight(nx, z, time, pointer);
  const depth = z ** 1.38;
  const horizonConvergence = PARAMS.topSpread + (1 - PARAMS.topSpread) * depth;
  const nearPerspective = .17 + .83 * PARAMS.perspective;
  const nearSpread = sourceWidth * (.34 + nearPerspective * .88) * PARAMS.scale * PARAMS.meshWidth;
  const parallaxX = pointer.sx * (7 + z * 18) * PARAMS.parallax * depth;
  const parallaxY = pointer.sy * (4 + z * 10) * PARAMS.parallax * depth;
  const centerX = sourceWidth * (.5 + PARAMS.offsetX);
  const centerY = sourceHeight * (PARAMS.horizon + PARAMS.offsetY);
  const vanishingX = centerX + sourceWidth * PARAMS.perspectiveDirection;
  const nearX = centerX + nx * nearSpread * .56;
  const x = vanishingX + (nearX - vanishingX) * horizonConvergence + parallaxX;
  const nearY = centerY + sourceHeight * 1.04 * PARAMS.scale * PARAMS.meshLength;
  const baseY = centerY + (nearY - centerY) * depth;
  const terrainInfluence = lerp(PARAMS.upperRelief, 1, depth);
  const lift = terrain * (10 + z * 44) * PARAMS.verticalScale * terrainInfluence;
  const tilt = nx * sourceHeight * PARAMS.tilt * (.3 + z) * depth;
  const y = baseY - lift + tilt + parallaxY;
  const angle = PARAMS.directionAngle * Math.PI / 180;
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const relativeX = x - centerX;
  const relativeY = y - centerY;
  point.x = centerX + relativeX * cosine - relativeY * sine;
  point.y = centerY + relativeX * sine + relativeY * cosine;
  point.x01 = x01;
  point.z = z;
  point.terrain = terrain;
}

function fitToSphere(grid: Point[][], width: number, height: number) {
  let minimumX = Infinity;
  let maximumX = -Infinity;
  let minimumY = Infinity;
  let maximumY = -Infinity;
  for (const row of grid) for (const point of row) {
    minimumX = Math.min(minimumX, point.x);
    maximumX = Math.max(maximumX, point.x);
    minimumY = Math.min(minimumY, point.y);
    maximumY = Math.max(maximumY, point.y);
  }
  const centerX = (minimumX + maximumX) / 2;
  const scale = 1.587 * Math.max(
    width * 1.35 / Math.max(1, maximumX - minimumX),
    height * .72 / Math.max(1, maximumY - minimumY),
  );
  for (const row of grid) for (const point of row) {
    point.x = width * .5 + (point.x - centerX) * scale;
    point.y = height * .25 + 10 + (point.y - minimumY) * scale;
  }
}

function buildFrame(grid: Point[][], seconds: number, pointer: PointerState, width: number, height: number) {
  const time = seconds * PARAMS.speed;
  for (let row = 0; row < CONTEXT_MESH.rows; row += 1) {
    for (let column = 0; column < CONTEXT_MESH.columns; column += 1) {
      projectPoint(column, row, time, pointer, grid[row][column]);
    }
  }
  fitToSphere(grid, width, height);
  return time;
}

export function createContextMeshSnapshot({ width, height, seconds, pointer: suppliedPointer }: ContextMeshOptions) {
  const pointer: PointerState = {
    x: suppliedPointer?.x ?? .72,
    y: suppliedPointer?.y ?? .63,
    sx: suppliedPointer?.sx ?? 0,
    sy: suppliedPointer?.sy ?? 0,
    tx: 0,
    ty: 0,
    inside: suppliedPointer?.inside ?? false,
  };
  const grid = createGrid();
  buildFrame(grid, seconds, pointer, width, height);
  return Float64Array.from(grid.flatMap(row => row.flatMap(point => [point.x, point.y])));
}

export function contextRippleDisplacement(point: Pick<Point, "x" | "y">, pulse: ContextPulse, elapsed: number, width: number, height: number) {
  const progress = clamp((elapsed - pulse.startedAt) / CONTEXT_MESH.pulseDuration);
  const circleRadius = Math.min(width, height) * .5;
  const farthestEdge = circleRadius + Math.hypot(pulse.x - width * .5, pulse.y - height * .5);
  const radius = progress * farthestEdge;
  const dx = point.x - pulse.x;
  const dy = point.y - pulse.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const bandWidth = Math.max(3, Math.min(width, height) * .028);
  const band = Math.exp(-((distance - radius) ** 2) / (bandWidth ** 2)) * (1 - progress);
  return {
    x: dx / distance * band * 3.2,
    y: dy / distance * band * 3.2,
    progress,
    radius,
  };
}

function ribbon(x: number, z: number, time: number) {
  const drift = time * .42;
  const band1 = .52 + Math.sin(drift + z * 5) * .022;
  const band2 = .70 + Math.cos(drift * .84 + z * 6) * .018;
  const band3 = .86 + Math.sin(drift * 1.12 + z * 4.2) * .016;
  return Math.max(
    Math.exp(-((x - band1) ** 2) / .01) * .72,
    Math.exp(-((x - band2) ** 2) / .011),
    Math.exp(-((x - band3) ** 2) / .009) * .9,
  );
}

function travelingPulse(z: number, time: number) {
  let value = 0;
  for (let index = 0; index < PARAMS.pulseCount; index += 1) {
    const phase = (time * PARAMS.pulseSpeed * .16 + index / PARAMS.pulseCount) % 1;
    let distance = Math.abs(z - phase);
    distance = Math.min(distance, 1 - distance);
    value = Math.max(value, Math.exp(-(distance * distance) / Math.max(.00003, PARAMS.pulseWidth ** 2)));
  }
  return value * PARAMS.pulseIntensity;
}

type Batch = { fillStyle: string; radius: number; points: number[] };

class ContextTerrainRenderer {
  private readonly grid = createGrid();
  private width = 1;
  private height = 1;
  private ratio = 1;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly context: CanvasRenderingContext2D) {}

  resize(width = this.canvas.clientWidth, height = this.canvas.clientHeight) {
    // The control owns the layout size; canvas intrinsic dimensions must not
    // feed back into measurement while CSS and entrance transforms settle.
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
    this.ratio = Math.min(window.devicePixelRatio || 1, PARAMS.dprCap);
    const targetWidth = Math.round(this.width * this.ratio);
    const targetHeight = Math.round(this.height * this.ratio);
    if (this.canvas.width !== targetWidth || this.canvas.height !== targetHeight) {
      this.canvas.width = targetWidth;
      this.canvas.height = targetHeight;
    }
    this.context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
  }

  draw(seconds: number, pointer: PointerState, pulses: ContextPulse[], elapsed: number) {
    const { context, width, height, grid } = this;
    const time = buildFrame(grid, seconds, pointer, width, height);
    for (const row of grid) for (const point of row) for (const pulse of pulses) {
      const displacement = contextRippleDisplacement(point, pulse, elapsed, width, height);
      point.x += displacement.x;
      point.y += displacement.y;
    }

    context.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    context.save();
    context.beginPath();
    context.arc(width * .5, height * .5, Math.max(0, Math.min(width, height) * .5 - .5), 0, Math.PI * 2);
    context.clip();
    context.globalCompositeOperation = "lighter";
    context.globalAlpha = PARAMS.opacity;

    const primary = PARAMS.primaryColor;
    const highlight = PARAMS.highlightColor;
    const rowPulses = Array.from({ length: CONTEXT_MESH.rows }, (_, row) => travelingPulse(row / (CONTEXT_MESH.rows - 1), time));

    context.lineWidth = PARAMS.lineWidth;
    for (let row = 0; row < CONTEXT_MESH.rows; row += 2) {
      context.beginPath();
      for (let column = 0; column < CONTEXT_MESH.columns; column += 1) {
        const point = grid[row][column];
        if (column) context.lineTo(point.x, point.y); else context.moveTo(point.x, point.y);
      }
      context.strokeStyle = `rgba(${primary.r},${primary.g},${primary.b},${PARAMS.lineOpacity * (.35 + row / (CONTEXT_MESH.rows - 1) * .85)})`;
      context.stroke();
    }
    for (let column = 0; column < CONTEXT_MESH.columns; column += 3) {
      context.beginPath();
      for (let row = 0; row < CONTEXT_MESH.rows; row += 1) {
        const point = grid[row][column];
        if (row) context.lineTo(point.x, point.y); else context.moveTo(point.x, point.y);
      }
      context.strokeStyle = `rgba(${primary.r},${primary.g},${primary.b},${PARAMS.lineOpacity * .68})`;
      context.stroke();
    }

    const glowBatches = new Map<string, Batch>();
    const pointBatches = new Map<string, Batch>();
    for (let row = 0; row < CONTEXT_MESH.rows; row += 1) {
      const depth = row / (CONTEXT_MESH.rows - 1);
      for (let column = 0; column < CONTEXT_MESH.columns; column += 1) {
        const point = grid[row][column];
        if (point.x < -20 || point.x > width + 20 || point.y < -20 || point.y > height + 20) continue;
        const band = ribbon(point.x01, point.z, time);
        const rowPulse = rowPulses[row];
        const shimmer = .5 + .5 * Math.sin(column * .72 + row * .55 + time * PARAMS.shimmerSpeed);
        const shimmerMultiplier = 1 + (shimmer - .5) * PARAMS.shimmer * .7;
        const colorMix = clamp(.14 + band * .62 + rowPulse * .24 + Math.max(0, point.terrain) * .05);
        const alpha = clamp((.13 + depth * .72 + band * .22 + rowPulse * .19) * shimmerMultiplier);
        const radius = Math.max(.25, PARAMS.pointSize * (.46 + depth * 1.12 + band * .36 + rowPulse * .18));
        if (band > .34 || rowPulse > .34) {
          const alphaIndex = Math.round(alpha * 7);
          const radiusIndex = Math.max(1, Math.round(radius * (2.2 + PARAMS.glow * 1.3)));
          const key = `${alphaIndex}:${radiusIndex}`;
          const batch = glowBatches.get(key) ?? {
            fillStyle: `rgba(${highlight.r},${highlight.g},${highlight.b},${clamp((alphaIndex / 7) * .045 * PARAMS.glow)})`,
            radius: radiusIndex,
            points: [],
          };
          batch.points.push(point.x, point.y);
          glowBatches.set(key, batch);
        }
        const mixIndex = Math.round(colorMix * 7);
        const alphaIndex = Math.round(alpha * 9);
        const radiusIndex = Math.max(1, Math.round(radius * 2));
        const key = `${mixIndex}:${alphaIndex}:${radiusIndex}`;
        const mix = mixIndex / 7;
        const batch = pointBatches.get(key) ?? {
          fillStyle: `rgba(${Math.round(lerp(primary.r, highlight.r, mix))},${Math.round(lerp(primary.g, highlight.g, mix))},${Math.round(lerp(primary.b, highlight.b, mix))},${alphaIndex / 9})`,
          radius: radiusIndex / 2,
          points: [],
        };
        batch.points.push(point.x, point.y);
        pointBatches.set(key, batch);
      }
    }

    const paint = (batches: Map<string, Batch>) => {
      for (const batch of batches.values()) {
        context.beginPath();
        for (let index = 0; index < batch.points.length; index += 2) {
          const x = batch.points[index];
          const y = batch.points[index + 1];
          context.moveTo(x + batch.radius, y);
          context.arc(x, y, batch.radius, 0, Math.PI * 2);
        }
        context.fillStyle = batch.fillStyle;
        context.fill();
      }
    };
    paint(glowBatches);
    paint(pointBatches);

    const glowX = width * (.73 + PARAMS.offsetX * .25);
    const glowY = height * (.78 + PARAMS.offsetY * .2);
    const glowRadius = width * .28;
    const glow = context.createRadialGradient(glowX, glowY, 0, glowX, glowY, glowRadius);
    glow.addColorStop(0, `rgba(${highlight.r},${highlight.g},${highlight.b},${.105 * PARAMS.ambientGlow})`);
    glow.addColorStop(1, `rgba(${primary.r},${primary.g},${primary.b},0)`);
    context.fillStyle = glow;
    context.fillRect(0, 0, width, height);

    context.globalAlpha = 1;
    for (const pulse of pulses) {
      const displacement = contextRippleDisplacement({ x: pulse.x, y: pulse.y }, pulse, elapsed, width, height);
      context.beginPath();
      context.arc(pulse.x, pulse.y, displacement.radius, 0, Math.PI * 2);
      context.lineWidth = 1;
      context.strokeStyle = `rgba(255,104,114,${(1 - displacement.progress) * .58})`;
      context.shadowBlur = 7;
      context.shadowColor = "rgba(239,51,64,.72)";
      context.stroke();
    }
    context.restore();
  }
}

export function mountContextTerrain(root: HTMLElement, core: HTMLButtonElement, canvas: HTMLCanvasElement) {
  let context: CanvasRenderingContext2D | null = null;
  try {
    context = canvas.getContext("2d", { alpha: true, desynchronized: true });
  } catch {
    // The server-rendered SVG remains visible when canvas is unavailable.
  }
  if (!context) {
    root.dataset.hologramRenderer = "fallback";
    return;
  }

  const renderer = new ContextTerrainRenderer(canvas, context);
  const pointer: PointerState = { x: .72, y: .63, sx: 0, sy: 0, tx: 0, ty: 0, inside: false };
  const pulses: ContextPulse[] = [];
  let frame = 0;
  let animationFrame = 0;
  let activeSeconds = 0;
  let activeMilliseconds = 0;
  let previousTimestamp = 0;
  let lifecycleState: AnimationLifecycleState = {
    viewportKnown: false, inViewport: false, documentVisible: !document.hidden, reducedMotion: true, running: false,
  };
  let failed = false;
  let pendingResize = true;
  let highlightTimer = 0;

  root.dataset.hologramRenderer = "canvas";
  root.dataset.hologramEnhanced = "true";

  const updateDiagnostics = () => {
    root.dataset.hologramFrame = String(frame);
    root.dataset.hologramPulseCount = String(pulses.length);
    root.dataset.hologramPointerStrength = Math.hypot(pointer.sx, pointer.sy).toFixed(3);
  };
  const prunePulses = () => {
    for (let index = pulses.length - 1; index >= 0; index -= 1) {
      if (activeMilliseconds - pulses[index].startedAt >= CONTEXT_MESH.pulseDuration) pulses.splice(index, 1);
    }
  };
  const paint = () => {
    if (pendingResize) {
      renderer.resize(core.clientWidth, core.clientHeight);
      pendingResize = false;
    }
    renderer.draw(lifecycleState.reducedMotion ? 0 : activeSeconds, pointer, lifecycleState.reducedMotion ? [] : pulses, activeMilliseconds);
    canvas.dataset.ready = "true";
    updateDiagnostics();
  };
  const stop = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousTimestamp = 0;
  };
  const animate = (timestamp: number) => {
    const delta = previousTimestamp ? Math.min(1 / 28, Math.max(0, (timestamp - previousTimestamp) / 1000)) : 1 / 60;
    previousTimestamp = timestamp;
    activeSeconds += delta;
    activeMilliseconds += delta * 1000;
    const smoothScale = clamp(delta * 60, .25, 4);
    const smoothFactor = 1 - (1 - PARAMS.mouseSmoothing) ** smoothScale;
    pointer.sx += (pointer.tx - pointer.sx) * smoothFactor;
    pointer.sy += (pointer.ty - pointer.sy) * smoothFactor;
    prunePulses();
    paint();
    frame += 1;
    root.dataset.hologramFrame = String(frame);
    animationFrame = requestAnimationFrame(animate);
  };
  const synchronize = () => {
    stop();
    if (failed) {
      root.dataset.hologramMotion = "fallback";
      root.dataset.hologramRenderer = "fallback";
      return;
    }
    if (lifecycleState.reducedMotion) {
      root.dataset.hologramMotion = "static";
      pulses.length = 0;
      Object.assign(pointer, { sx: 0, sy: 0, tx: 0, ty: 0, inside: false });
      if (lifecycleState.inViewport && lifecycleState.documentVisible) paint();
    } else if (lifecycleState.running) {
      root.dataset.hologramMotion = "running";
      animationFrame = requestAnimationFrame(animate);
    } else {
      root.dataset.hologramMotion = "paused";
    }
  };
  const localPoint = (event: PointerEvent | MouseEvent) => {
    const bounds = core.getBoundingClientRect();
    return {
      x: clamp(event.clientX - bounds.left, 0, bounds.width),
      y: clamp(event.clientY - bounds.top, 0, bounds.height),
      width: bounds.width,
      height: bounds.height,
    };
  };
  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch" || lifecycleState.reducedMotion || !lifecycleState.running) return;
    const point = localPoint(event);
    pointer.x = clamp(point.x / point.width);
    pointer.y = clamp(point.y / point.height);
    pointer.tx = (pointer.x - .5) * 2;
    pointer.ty = (pointer.y - .5) * 2;
    pointer.inside = true;
  };
  const onPointerLeave = () => {
    pointer.tx = 0;
    pointer.ty = 0;
    pointer.inside = false;
  };
  const onActivate = (event: MouseEvent) => {
    if (lifecycleState.reducedMotion) {
      root.dataset.hologramInteraction = "highlight";
      window.clearTimeout(highlightTimer);
      highlightTimer = window.setTimeout(() => delete root.dataset.hologramInteraction, 500);
      return;
    }
    const bounds = core.getBoundingClientRect();
    const point = event.detail === 0
      ? { x: bounds.width / 2, y: bounds.height / 2 }
      : localPoint(event);
    if (pulses.length === CONTEXT_MESH.maxPulses) pulses.shift();
    pulses.push({ x: point.x, y: point.y, startedAt: activeMilliseconds });
    updateDiagnostics();
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    failed = true;
    delete canvas.dataset.ready;
    synchronize();
  };
  const onContextRestored = () => {
    failed = false;
    root.dataset.hologramRenderer = "canvas";
    pendingResize = true;
    synchronize();
  };

  const lifecycle = observeAnimationLifecycle(root, state => {
    lifecycleState = state;
    synchronize();
  });
  const resize = new ResizeObserver(() => {
    pendingResize = true;
    if (lifecycleState.inViewport && lifecycleState.documentVisible) paint();
  });

  core.addEventListener("pointermove", onPointerMove, { passive: true });
  core.addEventListener("pointerleave", onPointerLeave, { passive: true });
  core.addEventListener("click", onActivate);
  canvas.addEventListener("contextlost", onContextLost);
  canvas.addEventListener("contextrestored", onContextRestored);
  resize.observe(core);

  return () => {
    stop();
    window.clearTimeout(highlightTimer);
    pulses.length = 0;
    onPointerLeave();
    lifecycle.dispose();
    resize.disconnect();
    core.removeEventListener("pointermove", onPointerMove);
    core.removeEventListener("pointerleave", onPointerLeave);
    core.removeEventListener("click", onActivate);
    canvas.removeEventListener("contextlost", onContextLost);
    canvas.removeEventListener("contextrestored", onContextRestored);
    delete canvas.dataset.ready;
    root.dataset.hologramMotion = "stopped";
  };
}
