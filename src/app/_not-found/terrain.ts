export type Ripple = { x: number; y: number; born: number };
export type FieldInput = { x: number; y: number; strength: number; ripples: Ripple[] };

export function fieldInfluence(x: number, y: number, time: number, input: FieldInput) {
  if (input.strength === 0 && input.ripples.length === 0) return { lift: 0, light: 0 };
  const distance = Math.hypot(x - input.x, y - input.y);
  const hover = Math.max(0, 1 - distance / 150) ** 2 * input.strength;
  let wave = 0;
  for (const ripple of input.ripples) {
    const age = time - ripple.born;
    if (age < 0 || age >= 1) continue;
    const band = Math.max(0, 1 - Math.abs(Math.hypot(x - ripple.x, y - ripple.y) - age * 280) / 34);
    wave += band * band * Math.sin(age * Math.PI) * (1 - age);
  }
  return { lift: Math.min(8, hover * 6 + wave * 8), light: Math.min(1, hover * .75 + wave) };
}

export function terrainPoint(u: number, v: number, time: number, width: number, height: number) {
  const depth = v ** 1.6;
  const x = (u - .5) * width * (1.15 + depth * .38) + width * .5;
  const wave = Math.sin(u * 10.3 + v * 2.3 + time * .25) * .16
    + Math.sin(u * 17.8 - v * 5.8 - time * .19) * .075
    + Math.cos(u * 5.6 + v * 3.1 + time * .17) * .11;
  const y = height * (.25 + depth * .83 + wave * (.7 + depth * .5));
  return { x, y, depth };
}

export function drawTerrain(context: CanvasRenderingContext2D, width: number, height: number, time: number, input: FieldInput) {
  context.clearRect(0, 0, width, height);
  const columns = 94;
  const rows = 28;
  // Fine threads establish depth; the point field carries the foreground light.
  for (let row = 0; row < rows; row++) {
    const v = row / (rows - 1);
    context.beginPath();
    for (let column = 0; column < columns; column++) {
      const { x, y } = terrainPoint(column / (columns - 1), v, time, width, height);
      const { lift } = fieldInfluence(x, y, time, input);
      if (!column) context.moveTo(x, y - lift); else context.lineTo(x, y - lift);
    }
    const gradient = context.createLinearGradient(0, 0, width, 0);
    const alpha = .055 + v * .11;
    gradient.addColorStop(0, `rgba(239,51,64,${alpha * 1.7})`);
    gradient.addColorStop(.35, `rgba(130,137,153,${alpha * .55})`);
    gradient.addColorStop(.7, `rgba(152,202,223,${alpha})`);
    gradient.addColorStop(1, `rgba(216,238,244,${alpha})`);
    context.strokeStyle = gradient;
    context.lineWidth = .55;
    context.stroke();
    for (let column = 0; column < columns; column++) {
      const u = column / (columns - 1);
      const { x, y, depth } = terrainPoint(u, v, time, width, height);
      const { lift, light } = fieldInfluence(x, y, time, input);
      const crimson = Math.max(0, 1 - u / .36);
      const r = Math.round(166 + crimson * 83 + light * 6);
      const g = Math.round(202 - crimson * 164 + light * 25);
      const b = Math.round(217 - crimson * 163 + light * 22);
      const sparkle = .65 + Math.sin(column * 7.1 + row * 13.7) * .35;
      const alpha = Math.min(.95, (.28 + depth * .68) * sparkle + light * .75);
      const radius = .55 + depth * .85 + light * .65;
      if (light > .08 || (crimson > .4 && (row + column) % 19 === 0)) {
        context.fillStyle = `rgba(${r},${g},${b},${.055 + light * .07})`;
        context.beginPath(); context.arc(x, y - lift, radius * 4.5, 0, Math.PI * 2); context.fill();
      }
      context.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      context.beginPath(); context.arc(x, y - lift, radius, 0, Math.PI * 2); context.fill();
    }
  }
}
