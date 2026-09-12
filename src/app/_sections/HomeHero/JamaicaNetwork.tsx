"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";
import { observeAnimationLifecycle } from "@/lib/animationLifecycle";
import styles from "./JamaicaNetwork.module.css";

// Geometry and 12-second choreography adapted from the supplied map loop V2.
// These are illustrative connections, not a map of deployed infrastructure.
const HUB = { x: 620, y: 642 };
const ROUTES = [
  { id: "florida", x: 250, y: 88, lift: 70, crimson: false },
  { id: "cuba", x: 418, y: 230, lift: 120, crimson: false },
  { id: "hispaniola", x: 800, y: 380, lift: 125, crimson: true },
  { id: "puerto-rico", x: 1080, y: 475, lift: 135, crimson: false },
  { id: "europe", x: 1260, y: 112, lift: 95, crimson: false },
  { id: "africa", x: 1432, y: 318, lift: 220, crimson: true },
].map(route => {
  const dx = route.x - HUB.x;
  const highest = Math.min(HUB.y, route.y) - route.lift;
  const c1y = Math.min(HUB.y - route.lift * .58, highest + route.lift * .3);
  const c2y = Math.min(route.y - route.lift * .58, highest + route.lift * .12);
  return { ...route, path: `M ${HUB.x} ${HUB.y} C ${HUB.x + dx * .32} ${c1y}, ${HUB.x + dx * .72} ${c2y}, ${route.x} ${route.y}` };
});

const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

export function JamaicaNetwork() {
  const ref = useRef<HTMLDivElement>(null);
  const glowId = useId();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const scene = element.querySelector<SVGGElement>("[data-network-scene]")!;
    const hub = element.querySelector<SVGGElement>("[data-network-hub]")!;
    const hubRing = element.querySelector<SVGCircleElement>("[data-hub-ring]")!;
    const hubHalo = element.querySelector<SVGCircleElement>("[data-hub-halo]")!;
    const paths = [...element.querySelectorAll<SVGPathElement>("[data-network-route]")];
    const signals = [...element.querySelectorAll<SVGCircleElement>("[data-network-signal]")];
    const nodes = [...element.querySelectorAll<SVGGElement>("[data-network-node]")];
    const lengths = paths.map(path => path.getTotalLength());
    let lifecycleState = { running: false, reducedMotion: true };
    let frame = 0;
    let elapsed = 0;
    let previous: number | null = null;
    let lastDraw = 0;

    const render = (time: number | null) => {
      const isStatic = time === null;
      const t = isStatic ? 8 : time % 12;
      const fade = 1 - ease((t - 9.85) / 1.8);
      const activation = isStatic ? 1 : ease((t - .8) / .9);
      scene.style.opacity = String(fade);
      hub.style.opacity = String(activation);
      hubRing.setAttribute("r", String(8 + 12 * activation));
      hubHalo.setAttribute("r", String(14 + 28 * activation));
      paths.forEach((path, index) => {
        const end = 1.35 + index * .48 + 2.6;
        const progress = isStatic ? 1 : ease((t - (end - 2.6)) / 2.6);
        path.style.strokeDasharray = String(lengths[index]);
        path.style.strokeDashoffset = String(lengths[index] * (1 - progress));
        nodes[index].style.opacity = String(ease((progress - .74) / .26));
        const signal = signals[index];
        if (isStatic || progress <= .04) {
          signal.style.opacity = "0";
          return;
        }
        // Follow the drawing edge, then send repeated signals outward from Jamaica.
        const position = progress < 1 ? progress : ((t - end) * .18) % 1;
        const point = path.getPointAtLength(lengths[index] * position);
        signal.setAttribute("cx", String(point.x));
        signal.setAttribute("cy", String(point.y));
        signal.style.opacity = String(Math.min(1, progress * 2.2));
      });
    };

    const tick = (now: number) => {
      if (previous !== null) elapsed += Math.min(now - previous, 100);
      previous = now;
      if (now - lastDraw >= 1000 / 30) {
        render(elapsed / 1000);
        lastDraw = now;
      }
      frame = requestAnimationFrame(tick);
    };

    const synchronize = () => {
      cancelAnimationFrame(frame);
      previous = null;
      if (lifecycleState.reducedMotion) {
        element.dataset.motion = "reduced";
        render(null);
      } else {
        render(elapsed / 1000);
        const running = lifecycleState.running;
        element.dataset.motion = running ? "running" : "offscreen";
        if (running) frame = requestAnimationFrame(tick);
      }
      // Reveal only after every SVG element has its starting pose, before paint.
      element.dataset.networkReady = "true";
    };

    const lifecycle = observeAnimationLifecycle(element, state => {
      lifecycleState = state;
      synchronize();
    }, { minVisibleRatio: .12 });
    return () => {
      cancelAnimationFrame(frame);
      lifecycle.dispose();
      delete element.dataset.networkReady;
    };
  }, []);

  return <div ref={ref} className={styles.map} data-testid="jamaica-network">
    <noscript><style>{`.${styles.map} .${styles.scene} { visibility: visible; }`}</style></noscript>
    <div className={styles.artwork} aria-hidden="true">
      <Image className={styles.image}
        src="/pages/home/animation/mapa/CrimsonTide_Map_Loop_Prototype_v2/assets/caribbean-map.png"
        alt="" width={1672} height={941}
        sizes="(max-width: 767px) 740px, (max-width: 1023px) 1100px, 85vw"
        loading="eager" fetchPriority="high" data-testid="hero-map-image" />
      <svg className={styles.network} viewBox="0 0 1672 941" focusable="false">
        <defs>
          <filter id={glowId} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" />
            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g className={styles.scene} data-network-scene="">
          {ROUTES.map(route => <path key={route.id} d={route.path} data-network-route={route.id}
            className={`${styles.route} ${route.crimson ? styles.crimson : ""}`} />)}
          {ROUTES.map(route => <circle key={route.id} data-network-signal="" r="4" opacity="0"
            filter={`url(#${glowId})`} className={`${styles.signal} ${route.crimson ? styles.crimson : ""}`} />)}
          {ROUTES.map(route => <g key={route.id} data-network-node=""
            className={`${styles.node} ${route.crimson ? styles.crimson : ""}`}>
            <circle cx={route.x} cy={route.y} r="13" className={styles.nodeRing} />
            <circle cx={route.x} cy={route.y} r="5" />
          </g>)}
          <g data-network-hub="">
            <circle cx={HUB.x} cy={HUB.y} r="42" data-hub-halo="" className={styles.hubHalo} />
            <circle cx={HUB.x} cy={HUB.y} r="20" data-hub-ring="" className={styles.hubRing} />
            <circle cx={HUB.x} cy={HUB.y} r="6" filter={`url(#${glowId})`} className={styles.hubCore} />
            <text x="652" y="676" className={styles.label}>JAMAICA</text>
          </g>
        </g>
      </svg>
    </div>
  </div>;
}
