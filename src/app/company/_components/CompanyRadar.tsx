"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { observeAnimationLifecycle } from "@/lib/animationLifecycle";
import styles from "./CompanyRadar.module.css";

export function CompanyRadar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const lifecycle = observeAnimationLifecycle(element, state => {
      element.dataset.motion = state.running ? "running" : "paused";
      element.dataset.reducedMotion = String(state.reducedMotion);
    });
    return () => lifecycle.dispose();
  }, []);
  return <div ref={ref} className={styles.artwork} data-testid="company-radar" aria-hidden="true">
    <div className={styles.scene}>
      <Image src="/pages/company/company/images/company-radar.png" alt="" fill sizes="(max-width: 767px) 700px, (max-width: 1067px) 1067px, 100vw" preload />
  <svg className={styles.fx} viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="company-coreGlow">
        <stop offset="0" stopColor="#ff5b69" stopOpacity=".95"/>
        <stop offset=".25" stopColor="#ff2438" stopOpacity=".65"/>
        <stop offset="1" stopColor="#ff2438" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id="company-sweepGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ff2438" stopOpacity="0"/>
        <stop offset=".72" stopColor="#ff2438" stopOpacity=".025"/>
        <stop offset="1" stopColor="#ff4052" stopOpacity=".24"/>
      </linearGradient>
      <filter id="company-glow" x="-300%" y="-300%" width="600%" height="600%">
        <feGaussianBlur stdDeviation="9" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="company-softGlow" x="-300%" y="-300%" width="600%" height="600%">
        <feGaussianBlur stdDeviation="3.2" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>

    
    <g opacity=".75">
      <circle className={styles["scan-ring"]} cx="835" cy="410" r="84"/>
      <circle className={styles["scan-ring"]} cx="835" cy="410" r="126"/>
      <circle className={styles["scan-ring"]} cx="835" cy="410" r="174"/>
    </g>

    
    <g className={styles["sweep"]}>
      <path d="M835 410 L821 28 A382 382 0 0 1 945 49 Z"
            fill="url(#company-sweepGradient)" opacity=".55"/>
      <line x1="835" y1="410" x2="945" y2="49"
            stroke="#ff4052" strokeOpacity=".18" strokeWidth="1"/>
    </g>

    
    <circle className={styles["wave"] + " " + styles["w1"]} cx="835" cy="410" r="34"/>
    <circle className={styles["wave"] + " " + styles["w2"]} cx="835" cy="410" r="34"/>
    <circle className={styles["wave"] + " " + styles["w3"]} cx="835" cy="410" r="34"/>

    
    <g>
      <circle className={styles["ping"] + " " + styles["p2"]} cx="964" cy="309" r="2.2"/>
      <circle className={styles["ping"] + " " + styles["p3"]} cx="1116" cy="291" r="2.0"/>
      <circle className={styles["ping"] + " " + styles["p4"]} cx="1288" cy="176" r="2.1"/>
      <circle className={styles["ping"] + " " + styles["p5"]} cx="607" cy="503" r="2.1"/>
      <circle className={styles["ping"] + " " + styles["p6"]} cx="1037" cy="671" r="2.0"/>
      <circle className={styles["ping"] + " " + styles["p7"]} cx="1432" cy="444" r="2.0"/>
    </g>

    
    <circle className={styles["core-halo"]} cx="835" cy="410" r="31" fill="url(#company-coreGlow)" filter="url(#company-glow)"/>
    <circle cx="835" cy="410" r="10.5" fill="none" stroke="#ff4052" strokeOpacity=".82" strokeWidth="1.4"/>
    <circle className={styles["core-dot"]} cx="835" cy="410" r="5.7" fill="#fff1f3" filter="url(#company-softGlow)"/>
  </svg>
    </div>
  </div>;
}
