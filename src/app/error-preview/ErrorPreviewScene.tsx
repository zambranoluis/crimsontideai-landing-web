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

  return <div ref={scene} className={styles.artwork} data-error-artwork data-light-ready="false" data-motion="paused" data-hover="none">
    <img className={`${styles.layer} ${styles.cloudStars}`} data-scene-layer="clouds" src="/error_page/cloud-stars.png" width="1672" height="941" alt="" aria-hidden="true" fetchPriority="high" />
    <img className={`${styles.layer} ${styles.planet}`} data-scene-layer="planet" src="/error_page/planet.png" width="1254" height="1254" alt="" aria-hidden="true" />
    <div className={styles.planetAura} data-planet-aura aria-hidden="true" />
    <img className={`${styles.layer} ${styles.redDust}`} data-scene-layer="dust" src="/error_page/red-dust.png" width="1672" height="941" alt="" aria-hidden="true" />
    <img className={`${styles.layer} ${styles.terrain}`} data-scene-layer="terrain" src="/error_page/terrain.png" width="1672" height="941" alt="" aria-hidden="true" />
    <canvas className={styles.light} data-error-light aria-hidden="true" />
    <button type="button" className={styles.astronautControls} data-error-light-controls aria-label="Aim searchlight and release a dust disturbance" aria-describedby="searchlight-hint" disabled>
      <img data-scene-layer="astronaut" src="/error_page/astronaut.png" width="1086" height="1448" alt="" aria-hidden="true" />
    </button>
    <p id="searchlight-hint" className={styles.searchlightHint}>Aim: pointer or arrow keys. Home resets. Enter or Space releases dust.</p>
    <button type="button" className={styles.pauseMotion} data-error-pause hidden aria-pressed="false">Pause animation</button>
    <div className={`${styles.annotation} ${styles.annotationExplore}`} aria-hidden="true"><span />EXPLORING<br />A BRIGHTER<br />TOMORROW<br /><b>{"///"}</b></div>
    <div className={`${styles.annotation} ${styles.annotationIdeas}`} aria-hidden="true">IDEAS<br />INTELLIGENCE<br />A BRIGHTER<br />TOMORROW<br /><b>{"///"}</b></div>
    <div className={`${styles.annotation} ${styles.annotationJamaica}`} aria-hidden="true"><span />BUILT<br />IN JAMAICA<br />GLOBAL IMPACT<br /><b>{"///"}</b></div>
  </div>;
}
