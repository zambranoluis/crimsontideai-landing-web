"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import styles from "./Orbit.module.css";

type OrbitTrack = "relationships" | "case" | "solutions";

const panels: ReadonlyArray<{ track: OrbitTrack; label: string; href: string; iconClass: string; positionClass: string }> = [
  { track: "relationships", label: "Real experience", href: "#work-clients", iconClass: styles.peopleIcon, positionClass: styles.people },
  { track: "case", label: "Proven in practice", href: "#work-cases", iconClass: styles.shieldIcon, positionClass: styles.shield },
  { track: "solutions", label: "Built for what’s next", href: "/solutions", iconClass: styles.rocketIcon, positionClass: styles.rocket },
];

export function Orbit() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointerFrameRef = useRef<number | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [enhanced, setEnhanced] = useState(false);
  const [visible, setVisible] = useState(false);
  const [documentActive, setDocumentActive] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highlightedTrack, setHighlightedTrack] = useState<OrbitTrack | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setReducedMotion(motionPreference.matches);
    const updateDocumentState = () => setDocumentActive(document.visibilityState === "visible");
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: "0px", threshold: 0 });

    updateMotionPreference();
    updateDocumentState();
    root.dataset.pointerState = "neutral";
    observer.observe(root);
    motionPreference.addEventListener("change", updateMotionPreference);
    document.addEventListener("visibilitychange", updateDocumentState);
    setEnhanced(true);

    return () => {
      observer.disconnect();
      motionPreference.removeEventListener("change", updateMotionPreference);
      document.removeEventListener("visibilitychange", updateDocumentState);
      if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    };
  }, []);

  const running = enhanced && visible && documentActive && !reducedMotion;

  const resetPointer = () => {
    const root = rootRef.current;
    if (!root) return;
    pointerRef.current = { x: 0, y: 0 };
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = null;
    root.style.setProperty("--orbit-pointer-x", "0px");
    root.style.setProperty("--orbit-pointer-y", "0px");
    root.dataset.pointerState = "neutral";
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType === "touch") return;
    const root = rootRef.current;
    if (!root) return;
    const rect = root.getBoundingClientRect();
    pointerRef.current = {
      x: Math.max(-10, Math.min(10, ((event.clientX - rect.left) / rect.width - .5) * 20)),
      y: Math.max(-8, Math.min(8, ((event.clientY - rect.top) / rect.height - .5) * 16)),
    };
    root.dataset.pointerState = "moved";
    if (pointerFrameRef.current !== null) return;
    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const currentRoot = rootRef.current;
      if (!currentRoot) return;
      currentRoot.style.setProperty("--orbit-pointer-x", `${pointerRef.current.x.toFixed(2)}px`);
      currentRoot.style.setProperty("--orbit-pointer-y", `${pointerRef.current.y.toFixed(2)}px`);
    });
  };

  return <div
    ref={rootRef}
    className={styles.orbit}
    data-testid="work-orbit"
    data-orbit-enhanced={enhanced ? "true" : undefined}
    data-orbit-active={running ? "true" : "false"}
    data-orbit-visible={visible ? "true" : "false"}
    data-orbit-document={documentActive ? "active" : "hidden"}
    data-orbit-motion={reducedMotion ? "reduced" : "allowed"}
    data-highlight={highlightedTrack ?? undefined}
    onPointerMove={handlePointerMove}
    onPointerLeave={() => { resetPointer(); setHighlightedTrack(null); }}
  >
    <div className={styles.movingField}>
      <svg className={styles.rings} viewBox="0 0 620 620" aria-hidden="true">
        <circle className={`${styles.ring} ${styles.dottedOuter}`} cx="310" cy="310" r="292" />
        <circle className={`${styles.ring} ${styles.dottedInner}`} cx="310" cy="310" r="278" />
        <circle className={`${styles.ring} ${styles.relationshipTrack}`} cx="310" cy="310" r="265" />
        <circle className={`${styles.ring} ${styles.caseTrack}`} cx="310" cy="310" r="219" />
        <circle className={`${styles.ring} ${styles.solutionsTrack}`} cx="310" cy="310" r="171" />
        <circle className={`${styles.vector} ${styles.vectorOuter}`} cx="310" cy="310" r="265" pathLength="100" />
        <circle className={`${styles.vector} ${styles.vectorMiddle}`} cx="310" cy="310" r="219" pathLength="100" />
        <circle className={`${styles.vector} ${styles.vectorInner}`} cx="310" cy="310" r="171" pathLength="100" />
        <g className={`${styles.particleOrbit} ${styles.particleOuter}`}><circle className={styles.particle} cx="575" cy="310" r="7" /></g>
        <g className={`${styles.particleOrbit} ${styles.particleMiddle}`}><circle className={styles.particle} cx="529" cy="310" r="6" /></g>
        <g className={`${styles.particleOrbit} ${styles.particleInner}`}><circle className={styles.particle} cx="481" cy="310" r="5" /></g>
      </svg>

      <div className={styles.hub} aria-hidden="true"><span /></div>

      <nav aria-label="Explore CrimsonTide experience" className={styles.panelLayer}>
        {panels.map((panel) => <Link
          key={panel.track}
          href={panel.href}
          prefetch={false}
          className={`${styles.panel} ${panel.positionClass}`}
          data-orbit-panel={panel.track}
          onPointerEnter={() => setHighlightedTrack(panel.track)}
          onPointerLeave={() => setHighlightedTrack(null)}
          onFocus={() => setHighlightedTrack(panel.track)}
          onBlur={() => setHighlightedTrack(null)}
        >
          <span className={`${styles.panelIcon} ${panel.iconClass}`} aria-hidden="true" />
          <span>{panel.label}</span>
        </Link>)}
      </nav>
    </div>
  </div>;
}
