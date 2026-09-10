"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./WarehouseVideo.module.css";

export function WarehouseVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let disposed = false;
    const shouldPlay = () => !disposed && visible && !document.hidden && !preference.matches;
    const syncPlayback = () => {
      if (shouldPlay()) {
        void video.play().then(() => {
          // Visibility can change while the browser is preparing playback.
          if (!shouldPlay()) video.pause();
        }).catch(() => { /* Keep the poster visible if autoplay is blocked. */ });
      } else {
        video.pause();
      }
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && entry.intersectionRatio >= .1;
      syncPlayback();
    }, { threshold: [0, .1] });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    preference.addEventListener("change", syncPlayback);
    return () => {
      disposed = true;
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      preference.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, []);

  return <figure className={styles.media} data-testid="warehouse-media">
    <video
      ref={ref}
      className={styles.video}
      src="/pages/home/warehouse.mp4"
      poster="/pages/home/warehouse-poster.jpg"
      width={496}
      height={744}
      preload="none"
      muted
      loop
      playsInline
      aria-label="Conceptual warehouse animation showing camera detection and operational analytics"
      aria-describedby="warehouse-caption"
      onError={() => setFailed(true)}
    />
    <figcaption id="warehouse-caption" className={styles.caption}>Conceptual visual</figcaption>
    {failed && <span className={styles.error} role="status">Animation unavailable</span>}
  </figure>;
}
