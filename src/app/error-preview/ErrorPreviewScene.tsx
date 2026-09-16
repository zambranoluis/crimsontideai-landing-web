"use client";

import { useEffect, useRef } from "react";
import styles from "./ErrorPreviewScene.module.css";

export function ErrorPreviewScene() {
  const scene = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let cleanup: (() => void) | undefined;
    void import("./runtime")
      .then(({ mountErrorPreviewLight }) => {
        if (!disposed && scene.current) cleanup = mountErrorPreviewLight(scene.current);
      })
      .catch(() => {
        /* The layered server-rendered composition remains complete. */
      });
    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return <div ref={scene} className={styles.artwork} data-error-artwork data-light-ready="false" data-motion="paused">
    <img className={`${styles.layer} ${styles.cloudStars}`} src="/error_page/cloud-stars.png" width="1672" height="941" alt="" aria-hidden="true" fetchPriority="high" />
    <img className={`${styles.layer} ${styles.planet}`} src="/error_page/planet.png" width="1254" height="1254" alt="" aria-hidden="true" />
    <img className={`${styles.layer} ${styles.redDust}`} src="/error_page/red-dust.png" width="1672" height="941" alt="" aria-hidden="true" />
    <img className={`${styles.layer} ${styles.terrain}`} src="/error_page/terrain.png" width="1672" height="941" alt="" aria-hidden="true" />
    <canvas className={styles.light} data-error-light aria-hidden="true" />
    <div className={styles.astronautControls} data-error-light-controls role="group" aria-label="Searchlight controls" aria-describedby="searchlight-hint" aria-disabled="true" tabIndex={-1}>
      <img src="/error_page/astronaut.png" width="1086" height="1448" alt="" aria-hidden="true" />
    </div>
    <p id="searchlight-hint" className={styles.searchlightHint}>Aim: pointer or arrow keys. Home resets.</p>
    <div className={`${styles.annotation} ${styles.annotationExplore}`} aria-hidden="true"><span />EXPLORING<br />A BRIGHTER<br />TOMORROW<br /><b>{"///"}</b></div>
    <div className={`${styles.annotation} ${styles.annotationIdeas}`} aria-hidden="true">IDEAS<br />INTELLIGENCE<br />A BRIGHTER<br />TOMORROW<br /><b>{"///"}</b></div>
    <div className={`${styles.annotation} ${styles.annotationJamaica}`} aria-hidden="true"><span />BUILT<br />IN JAMAICA<br />GLOBAL IMPACT<br /><b>{"///"}</b></div>
  </div>;
}
