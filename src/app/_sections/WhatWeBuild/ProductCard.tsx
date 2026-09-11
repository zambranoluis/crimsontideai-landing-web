"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { observeAnimationLifecycle } from "@/lib/animationLifecycle";
import styles from "./WhatWeBuild.module.css";

export function ProductCard({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    const lifecycle = observeAnimationLifecycle(card, state => {
      card.dataset.motion = state.running ? "running" : "paused";
    });
    return () => lifecycle.dispose();
  }, []);

  return <article ref={ref} className={styles.productCard}>
    <span className={styles.shimmer} aria-hidden="true" />
    {children}
  </article>;
}
