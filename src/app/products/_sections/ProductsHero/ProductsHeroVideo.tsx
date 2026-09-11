"use client";

import { useEffect, useRef } from "react";
import { observeAnimationLifecycle } from "@/lib/animationLifecycle";
import styles from "./ProductsHero.module.css";

export function ProductsHeroVideo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let playbackRequest = 0;
    let disposed = false;
    const lifecycle = observeAnimationLifecycle(video, state => {
      const request = ++playbackRequest;
      video.dataset.motion = state.reducedMotion ? "reduced" : state.running ? "running" : "paused";
      if (!state.running) {
        video.pause();
        return;
      }
      void video.play().then(() => {
        // A play request may resolve after a rapid exit, tab hide, or preference change.
        if (disposed || request !== playbackRequest || !lifecycle.state.running) video.pause();
      }).catch(() => { /* The poster remains visible when autoplay is unavailable. */ });
    });
    return () => {
      disposed = true;
      playbackRequest += 1;
      lifecycle.dispose();
      video.pause();
    };
  }, []);

  return <video
    ref={ref}
    className={styles.heroMedia}
    poster="/pages/products/image/hero.png"
    preload="none"
    muted
    loop
    playsInline
    aria-hidden="true"
    data-testid="products-hero-video"
  >
    <source src="/pages/products/city-night.mp4" type="video/mp4" />
  </video>;
}
