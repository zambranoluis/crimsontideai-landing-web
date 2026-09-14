"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { NavigationMain } from "@/components/navigation/SiteNavigation";
import styles from "./NotFound.module.css";

export function NotFoundMain({ children, className }: { children: ReactNode; className: string }) {
  const pathname = usePathname();
  return <NavigationMain id="main-content" pathname={pathname} tabIndex={-1} className={className}>{children}</NavigationMain>;
}

export function NotFoundScene({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("./runtime").then(({ mountNotFoundScene }) => {
      if (!disposed && ref.current) cleanup = mountNotFoundScene(ref.current);
    }).catch(() => { /* The server-rendered scene remains complete. */ });
    return () => { disposed = true; cleanup?.(); };
  }, []);

  return <div ref={ref} className={styles.scene} data-testid="not-found-scene">
    <svg className={styles.stars} width="100%" height="100%" viewBox="0 0 1600 850" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {Array.from({ length: 135 }, (_, i) => <circle key={i} cx={(i * 743.13 + 57) % 1600} cy={(i * i * 11.73 + 13) % 850} r={i % 9 === 0 ? 1.2 : .65} fill={i % 7 === 0 ? "#d7ac9c" : "#c9e1ec"} opacity={.15 + (i % 6) * .1} />)}
    </svg>
    <div className={styles.grid} aria-hidden="true" />
    {children}
    <div className={styles.globe} data-globe-host>
      {/* Native images deliberately match the canvases and work without hydration. */}
      <img className={styles.globePoster} src="/pages/not-found/globe-poster.png" width="1008" height="900" alt="" aria-hidden="true" fetchPriority="high" />
      <canvas className={styles.globeCanvas} data-globe-canvas aria-hidden="true" />
      <button type="button" className={styles.globeButton} data-globe-button aria-label="Send a signal around the globe" disabled />
      <div className={`${styles.annotation} ${styles.annotationTop}`} aria-hidden="true">REAL PROBLEMS<br />BRIGHTER SOLUTIONS</div>
      <div className={`${styles.annotation} ${styles.annotationRight}`} aria-hidden="true">AI<br />PEOPLE<br />A BRIGHTER<br />TOMORROW</div>
      <div className={`${styles.annotation} ${styles.annotationSignal}`} aria-hidden="true">STILL EXPLORING<br />A BRIGHTER<br />TOMORROW</div>
      <div className={`${styles.annotation} ${styles.annotationBottom}`} aria-hidden="true">JAMAICA<br />GLOBAL IMPACT</div>
    </div>
    <div className={styles.terrain} data-terrain-host aria-hidden="true">
      <img className={styles.terrainPoster} src="/pages/not-found/terrain-poster.png" width="1680" height="330" alt="" />
      <canvas className={styles.terrainCanvas} data-terrain-canvas />
    </div>
    <button className={styles.motion} type="button" data-motion-button hidden>
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4 2v8M8 2v8" stroke="currentColor" strokeWidth="1.5" /></svg>
      <span data-motion-label>Pause animation</span>
    </button>
  </div>;
}
