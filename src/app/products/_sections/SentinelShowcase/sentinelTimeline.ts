const events = [
  [18, "enter", 12, 54], [43, "enter", 15, 78], [68, "exit", 4, 28],
  [92, "enter", 14, 94], [126, "enter", 17, 122], [151, "exit", 5, 37],
  [178, "enter", 16, 108], [207, "exit", 4, 31], [236, "enter", 19, 148],
  [264, "enter", 18, 166], [293, "exit", 6, 52], [324, "enter", 14, 118],
  [356, "exit", 5, 45], [388, "enter", 13, 101], [421, "enter", 12, 136],
  [456, "exit", 4, 34], [492, "enter", 10, 91], [528, "exit", 4, 39],
  [557, "enter", 10, 112], [581, "exit", 3, 30],
] as const;

export const flowEvents = events.map(([minute, type, delta, height]) => ({
  minute, type, delta, height, x: 455 + minute / 600 * 527,
}));

export const incidentColors = ["#79c796", "#ded43a", "#88dce4", "#c3c3c3", "#ed3442", "#ed3442"];
const incidentSnapshots = [
  [1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 2, 1], [1, 1, 1, 1, 2, 2],
  [1, 1, 1, 2, 2, 2], [1, 1, 2, 2, 2, 2], [1, 2, 2, 2, 2, 2],
];
const easeOut = (value: number) => 1 - (1 - Math.max(0, Math.min(1, value))) ** 3;

function ringSector(start: number, end: number) {
  const point = (radius: number, degrees: number) => {
    const angle = degrees * Math.PI / 180;
    return `${(1205 + radius * Math.cos(angle)).toFixed(3)} ${(430 + radius * Math.sin(angle)).toFixed(3)}`;
  };
  const large = end - start > 180 ? 1 : 0;
  return `M ${point(95, start)} A 95 95 0 ${large} 1 ${point(95, end)} L ${point(61, end)} A 61 61 0 ${large} 0 ${point(61, start)} Z`;
}

export function sentinelFrame(elapsed: number | null) {
  // Elapsed time is the demo's explicit 08:00-18:00 sweep, followed by a hold.
  const cycle = elapsed === null ? 13200 : elapsed % 14000;
  const progress = Math.min(1, cycle / 13200);
  let enter = 0;
  let exit = 0;
  const bars = flowEvents.map(event => {
    const reveal = easeOut((cycle - event.minute / 600 * 13200) / 260);
    const count = Math.round(event.delta * reveal);
    if (event.type === "enter") enter += count;
    else exit += count;
    return { y: 586 - event.height * reveal, opacity: reveal > 0 ? 1 : 0 };
  });

  const step = elapsed === null ? 5 : Math.floor(elapsed / 4200) % 10;
  const snapshotIndex = (index: number) => index <= 5 ? index : 10 - index;
  const current = incidentSnapshots[snapshotIndex(step)];
  const previous = incidentSnapshots[snapshotIndex((step + 9) % 10)];
  const transition = elapsed === null || elapsed < 4200 ? 1 : easeOut((elapsed % 4200) / 900);
  const values = current.map((value, index) => previous[index] + (value - previous[index]) * transition);
  const total = values.reduce((sum, value) => sum + value, 0);
  let cursor = -90;
  const sectors = values.map(value => {
    const end = cursor + value / total * 360;
    const path = ringSector(cursor + 1.7, end - 1.7);
    cursor = end;
    return path;
  });
  return { enter, exit, occupancy: enter - exit, incidents: Math.round(total), bars, sectors, scan: progress * 527 };
}
