"use client";

import { useRef } from "react";
import { flowEvents, incidentColors, sentinelFrame } from "./sentinelTimeline";
import { useProductAnimation } from "./useProductAnimation";
import styles from "./SentinelCharts.module.css";

const staticFrame = sentinelFrame(null);

export function SentinelCharts() {
  const bars = useRef<(SVGGElement | null)[]>([]);
  const sectors = useRef<(SVGPathElement | null)[]>([]);
  const scan = useRef<SVGGElement>(null);
  const enter = useRef<SVGTSpanElement>(null);
  const exit = useRef<SVGTSpanElement>(null);
  const occupancy = useRef<SVGTSpanElement>(null);
  const incidents = useRef<SVGTextElement>(null);

  useProductAnimation(elapsed => {
    const frame = sentinelFrame(elapsed);
    for (const [node, value] of [[enter.current, frame.enter], [exit.current, frame.exit],
      [occupancy.current, frame.occupancy], [incidents.current, frame.incidents]] as const) {
      if (node && node.textContent !== String(value)) node.textContent = String(value);
    }
    frame.bars.forEach((bar, index) => {
      const group = bars.current[index];
      if (!group) return;
      group.setAttribute("opacity", String(bar.opacity));
      group.children[0].setAttribute("y1", bar.y.toFixed(2));
      group.children[1].setAttribute("cy", bar.y.toFixed(2));
    });
    frame.sectors.forEach((path, index) => sectors.current[index]?.setAttribute("d", path));
    scan.current?.setAttribute("transform", `translate(${frame.scan.toFixed(2)} 0)`);
  });

  return (
    <svg className={styles.overlay} viewBox="0 0 1770 864" preserveAspectRatio="none"
      aria-hidden="true" data-testid="sentinel-charts">
      <rect className={styles.mask} x="455" y="368" width="527" height="219" />
      <line className={styles.axis} x1="455" y1="586" x2="982" y2="586" />
      {Array.from({ length: 24 }, (_, index) => <line key={index} className={styles.grid}
        x1={467 + index * 22} y1="369" x2={467 + index * 22} y2="586" />)}
      <rect className={styles.mask} x="449" y="588" width="540" height="24" />
      {["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"].map((label, index) =>
        <text key={label} className={styles.time} x={455 + index * 105.4} y="604">{label}</text>)}
      <rect className={styles.mask} x="410" y="320" width="230" height="18" />
      <text className={styles.metric} x="414" y="331" fill="#2b6fff">Enter: <tspan ref={enter} data-testid="sentinel-enter">{staticFrame.enter}</tspan></text>
      <text className={styles.metric} x="482" y="331" fill="#f34a50">Exit: <tspan ref={exit} data-testid="sentinel-exit">{staticFrame.exit}</tspan></text>
      <text className={styles.metric} x="543" y="331" fill="#fff47d">Occupancy: <tspan ref={occupancy} data-testid="sentinel-occupancy">{staticFrame.occupancy}</tspan></text>
      {flowEvents.map((event, index) => <g key={event.minute} ref={node => { bars.current[index] = node; }} opacity="1">
        <line x1={event.x} x2={event.x} y1={staticFrame.bars[index].y} y2="586" stroke={event.type === "enter" ? "#2f72ff" : "#ef3842"} strokeWidth="1.6" />
        <circle cx={event.x} cy={staticFrame.bars[index].y} r="3" fill={event.type === "enter" ? "#2f72ff" : "#ef3842"} />
      </g>)}
      <g ref={scan} transform={`translate(${staticFrame.scan} 0)`} data-testid="sentinel-scan">
        <line x1="455" y1="369" x2="455" y2="586" stroke="#3d7dff" strokeWidth="1" opacity=".32" />
        <circle cx="455" cy="377" r="2.3" fill="#4d86ff" />
      </g>
      <circle className={styles.mask} cx="1205" cy="430" r="99" />
      {staticFrame.sectors.map((path, index) => <path key={index} ref={node => { sectors.current[index] = node; }} d={path} fill={incidentColors[index]} />)}
      <text ref={incidents} className={styles.value} x="1205" y="438">{staticFrame.incidents}</text>
      <text className={styles.label} x="1205" y="451">Incidents</text>
    </svg>
  );
}
