"use client";

import { useEffect, useRef } from "react";
import { clampProgress, scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";
import styles from "./CaseIllustration.module.css";

export function CaseIllustration() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = ref.current;
    const section = element?.closest("[data-case-scene]");
    if (!element || !section) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let completed = false;
    const unsubscribe = subscribeScrollFrame(({ height }) => {
      const progress = preference.matches ? 1 : clampProgress((height * .8 - section.getBoundingClientRect().top) / (height * .5));
      completed ||= progress === 1;
      const value = completed ? 1 : progress;
      element.style.setProperty("--case-coverage", String(clampProgress(value * 2)));
      element.style.setProperty("--case-detection", String(clampProgress((value - .45) / .55)));
      element.dataset.caseProgress = String(value);
    });
    preference.addEventListener("change", scheduleScrollFrame);
    return () => { unsubscribe(); preference.removeEventListener("change", scheduleScrollFrame); };
  }, []);
  return <figure ref={ref} className={styles.media} data-testid="case-illustration">
    <svg viewBox="0 0 600 660" role="img" aria-label="Conceptual illustration of camera coverage across supermarket aisles">
      <defs>
        <radialGradient id="case-glow">
          <stop stopColor="#EF3340" stopOpacity=".16" />
          <stop offset="1" stopColor="#EF3340" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="320" cy="350" rx="280" ry="280" fill="url(#case-glow)" />
      <g transform="translate(440 240) scale(.78) rotate(30) skewX(-30)">
        <path d="M-190 0H190V360H-190Z" fill="#090D14" stroke="#9AA5B3" strokeOpacity=".4" />
        {[-140, -50, 40, 130].map((x, i) => <g key={x}>
          <path d={`M${x} 44h42v225h-42Z`} fill="#121925" stroke="#9AA5B3" strokeOpacity=".35" />
          {[65, 100, 135, 170, 205, 240].map(y => <g key={y}>
            <path d={`M${x} ${y}h42`} stroke="#9AA5B3" strokeOpacity=".35" />
            <path d={`M${x + 5} ${y - 15}h10v10h-10Zm17 0h10v10h-10Z`} fill={i % 2 ? "#7ED9FF" : "#9AA5B3"} fillOpacity=".16" />
          </g>)}
        </g>)}
        {[-125, -25, 75].map(x => <rect key={x} x={x} y="306" width="52" height="28" rx="3" fill="#0E141D" stroke="#7ED9FF" strokeOpacity=".35" />)}
        <path className={styles.coverage} d="M-165 18 65 185 170 25Z" fill="#EF3340" fillOpacity=".06" stroke="#EF3340" strokeOpacity=".3" strokeDasharray="5 6" />
        <path className={styles.coverage} d="M175 340-60 220-155 340Z" fill="#7ED9FF" fillOpacity=".035" stroke="#7ED9FF" strokeOpacity=".2" strokeDasharray="5 6" />
        <g className={styles.details} fill="#EF3340">
          <circle cx="-165" cy="18" r="5" />
          <circle cx="175" cy="340" r="5" />
        </g>
        <g className={styles.detection} stroke="#EF3340" strokeWidth="1.5" fill="#EF3340" fillOpacity=".08">
          <rect x="-91" y="147" width="28" height="35" />
          <rect x="88" y="276" width="30" height="37" />
        </g>
        <g fill="#BCC4CE">
          <circle cx="-77" cy="164" r="4" />
          <circle cx="103" cy="294" r="4" />
        </g>
      </g>
      <g stroke="#9AA5B3" strokeOpacity=".4" fill="none">
        <path d="M32 64V32h32m472 0h32v32M32 596v32h32m472 0h32v-32" />
      </g>
      <g fill="#7ED9FF" fillOpacity=".65">
        <circle cx="48" cy="48" r="3" />
        <circle cx="552" cy="612" r="3" />
      </g>
    </svg>
    <figcaption>Conceptual illustration</figcaption>
  </figure>;
}
