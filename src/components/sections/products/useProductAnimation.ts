"use client";

import { useEffect, useEffectEvent, useRef } from "react";
import { useProductMotion } from "./ProductMotion";

/** A null time requests the complete static composition. Time excludes suspension. */
export function useProductAnimation(render: (elapsed: number | null) => void) {
  const { running, reducedMotion } = useProductMotion();
  const elapsed = useRef(0);
  const draw = useEffectEvent(render);

  useEffect(() => {
    if (reducedMotion) {
      draw(null);
      return;
    }
    if (!running) return;
    let frame = 0;
    let previous: number | null = null;
    let lastDraw = 0;
    draw(elapsed.current);
    const tick = (time: number) => {
      if (previous !== null) elapsed.current += Math.min(time - previous, 64);
      previous = time;
      if (time - lastDraw >= 1000 / 30) {
        draw(elapsed.current);
        lastDraw = time;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running, reducedMotion]);
}
