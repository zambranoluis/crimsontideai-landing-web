"use client";

import { useEffect, useRef, type HTMLAttributes, type ReactNode } from "react";

type PointerGlowProps = {
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

export function PointerGlow({ children, className = "", ...props }: PointerGlowProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let pendingX = 0;
    let pendingY = 0;

    const reset = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      element.style.setProperty("--pointer-x", "50%");
      element.style.setProperty("--pointer-y", "50%");
      element.dataset.pointerState = "neutral";
    };

    const syncMode = () => {
      const enhanced = finePointer.matches && !reducedMotion.matches;
      element.dataset.pointerEnhanced = enhanced ? "true" : "false";
      element.dataset.pointerMotion = reducedMotion.matches ? "reduced" : "allowed";
      if (!enhanced) reset();
    };

    const commitPointer = () => {
      frame = 0;
      element.style.setProperty("--pointer-x", `${pendingX}px`);
      element.style.setProperty("--pointer-y", `${pendingY}px`);
      element.dataset.pointerState = "moved";
    };

    const onPointerMove = (event: PointerEvent) => {
      if (element.dataset.pointerEnhanced !== "true" || event.pointerType === "touch") return;
      const rect = element.getBoundingClientRect();
      pendingX = Math.max(0, Math.min(rect.width, event.clientX - rect.left));
      pendingY = Math.max(0, Math.min(rect.height, event.clientY - rect.top));
      if (!frame) frame = requestAnimationFrame(commitPointer);
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") reset();
    };

    syncMode();
    element.addEventListener("pointermove", onPointerMove, { passive: true });
    element.addEventListener("pointerleave", reset);
    element.addEventListener("pointercancel", reset);
    document.addEventListener("visibilitychange", onVisibilityChange);
    finePointer.addEventListener("change", syncMode);
    reducedMotion.addEventListener("change", syncMode);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerleave", reset);
      element.removeEventListener("pointercancel", reset);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      finePointer.removeEventListener("change", syncMode);
      reducedMotion.removeEventListener("change", syncMode);
    };
  }, []);

  return <div ref={ref} className={className} data-pointer-glow data-pointer-state="neutral" {...props}>{children}</div>;
}
