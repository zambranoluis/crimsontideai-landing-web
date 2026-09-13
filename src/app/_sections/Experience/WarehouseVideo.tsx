"use client";

import { useEffect, useRef, useState } from "react";
import { observeAnimationLifecycle } from "@/lib/animationLifecycle";
import styles from "./WarehouseVideo.module.css";

export function WarehouseVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let disposed = false;
    let playbackRequest = 0;
    const lifecycle = observeAnimationLifecycle(video, state => {
      const request = ++playbackRequest;
      video.dataset.motion = state.reducedMotion ? "reduced" : state.running ? "running" : "paused";
      if (state.running) {
        void video.play().then(() => {
          // Visibility can change while the browser is preparing playback.
          if (disposed || request !== playbackRequest || !lifecycle.state.running) video.pause();
        }).catch(() => { /* Keep the poster visible if autoplay is blocked. */ });
      } else {
        video.pause();
      }
    }, { minVisibleRatio: .1 });
    return () => {
      disposed = true;
      playbackRequest += 1;
      lifecycle.dispose();
      video.pause();
    };
  }, []);

  return <figure className={styles.media} data-testid="warehouse-media">
    <video
      ref={ref}
      className={styles.video}
      src="/pages/home/video-detection.mp4"
      poster="/pages/home/images/warehouse-poster.jpg"
      width={496}
      height={744}
      preload="none"
      muted
      loop
      playsInline
      aria-label="Conceptual warehouse animation showing camera detection and operational analytics"
      onError={() => setFailed(true)}
    />
    {failed && <span className={styles.error} role="status">Animation unavailable</span>}
  </figure>;
}
