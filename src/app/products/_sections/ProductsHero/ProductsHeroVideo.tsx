"use client";

import { useEffect, useState } from "react";
import styles from "./ProductsHero.module.css";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function ProductsHeroVideo() {
  const [motionAllowed, setMotionAllowed] = useState(false);

  useEffect(() => {
    const preference = matchMedia(REDUCED_MOTION_QUERY);
    const syncPreference = () => setMotionAllowed(!preference.matches);

    syncPreference();
    preference.addEventListener("change", syncPreference);
    return () => preference.removeEventListener("change", syncPreference);
  }, []);

  return <video
    key={motionAllowed ? "motion" : "poster"}
    className={styles.heroMedia}
    poster="/pages/products/image/hero.png"
    preload={motionAllowed ? "auto" : "none"}
    autoPlay={motionAllowed}
    muted
    loop
    playsInline
    aria-hidden="true"
    data-testid="products-hero-video"
  >
    {motionAllowed && <source src="/pages/products/city-night.mp4" type="video/mp4" />}
  </video>;
}
