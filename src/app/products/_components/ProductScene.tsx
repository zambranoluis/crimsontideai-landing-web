"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { clampProgress, scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";
import { ProductSceneContext, type ProductSceneState } from "./ProductSceneContext";
import styles from "./ProductScene.module.css";

export function ProductScene({ introduction, preview, children, product }: { introduction: ReactNode; preview: ReactNode; children: ReactNode; product: "openjm" | "sentinel" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scene, setScene] = useState<ProductSceneState>({ activeStep: 2, progress: 1, enabled: false });
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const eligibility = matchMedia("(min-width: 1024px) and (min-height: 700px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const steps = Array.from(element.querySelectorAll<HTMLElement>("[data-feature-step]"));
    let activeStep: 0 | 1 | 2 = 2;
    let enabled = false;
    let initialized = false;
    // Progress is an external animation value; React only receives discrete changes.
    let progress = 1;
    const unsubscribe = subscribeScrollFrame(({ height, header }) => {
      const nextEnabled = eligibility.matches;
      element.dataset.sceneEnabled = String(nextEnabled);
      element.closest("section")?.style.setProperty("--scene-header", `${header}px`);
      element.style.setProperty("--scene-top", `${header + 24}px`);
      element.style.setProperty("--scene-height", `${Math.max(0, height - header - 48)}px`);
      // Native smooth fragment scrolling can still target the shorter SSR layout
      // when hydration expands the scenes. Finish fragment placement once, after
      // sizing, including a client history return. Do not move a reader already
      // past the section's start, or intervene in subsequent scrolling/resizing.
      if (!initialized && nextEnabled && location.hash === `#products-${product}`) {
        const section = element.closest("section");
        if (section && section.getBoundingClientRect().top > header) {
          section.scrollIntoView({ block: "start", behavior: "instant" });
        }
      }
      initialized = true;
      const midpoint = header + (height - header) / 2;
      const centers = steps.map(step => { const rect = step.getBoundingClientRect(); return rect.top + rect.height / 2; });
      let nextStep: 0 | 1 | 2 = nextEnabled ? 0 : 2;
      if (nextEnabled) {
        if (centers[1] <= midpoint) nextStep = 1;
        if (centers[2] <= midpoint) nextStep = 2;
      }
      progress = nextEnabled ? clampProgress((midpoint - centers[0]) / Math.max(1, centers[2] - centers[0])) : 1;
      element.style.setProperty("--scene-progress", progress.toFixed(4));
      element.style.setProperty("--chart-scan", `${(clampProgress(progress * 2) * 527).toFixed(2)}px`);
      if (enabled !== nextEnabled || activeStep !== nextStep) {
        enabled = nextEnabled;
        activeStep = nextStep;
        setScene({ activeStep, enabled, get progress() { return progress; } });
      }
    });
    const resize = new ResizeObserver(scheduleScrollFrame);
    resize.observe(element);
    steps.forEach(step => resize.observe(step));
    eligibility.addEventListener("change", scheduleScrollFrame);
    return () => { unsubscribe(); resize.disconnect(); eligibility.removeEventListener("change", scheduleScrollFrame); };
  }, [product]);
  return <ProductSceneContext.Provider value={scene}>
    <div ref={ref} className={`${styles.scene} ${styles[product]}`} data-testid={`${product}-scene`} data-scene-enabled={scene.enabled} data-active-step={scene.activeStep}>
      <div className={styles.introduction}>{introduction}</div>
      <div className={styles.previewStage}>{preview}</div>
      <ol className={styles.steps}>{children}</ol>
    </div>
  </ProductSceneContext.Provider>;
}
