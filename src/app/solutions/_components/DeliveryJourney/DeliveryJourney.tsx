"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { clampProgress, scheduleScrollFrame, subscribeScrollFrame } from "@/lib/scrollFrame";
import styles from "./DeliveryJourney.module.css";

const stages = [
  {
    title: "Build",
    emphasis: "Turn the direction into a working solution.",
    body: "We develop the software and capabilities required to transform an approved concept into technology that can be used.",
    image: "/images/solutions/solution-build.png",
    className: styles.build,
  },
  {
    title: "Connect",
    emphasis: "Integrate it where it needs to work.",
    body: "When required, we connect the solution with the systems, processes, or environments that form part of its operation.",
    image: "/images/solutions/solution-connect.png",
    className: styles.connect,
  },
  {
    title: "Put into Use",
    emphasis: "Move from development to real implementation.",
    body: "We bring the solution into use within the organisation, considering what it needs to become part of the working environment.",
    image: "/images/solutions/solution-put-into-use.png",
    className: styles.use,
  },
] as const;

const ranges = [[.04, .28], [.34, .58], [.64, .88]] as const;

function applyStageProgress(stage: HTMLElement, progress: number) {
  const node = clampProgress(progress / .22);
  const visual = clampProgress((progress - .10) / .42);
  const vector = clampProgress((progress - .24) / .38);
  const title = clampProgress((progress - .36) / .34);
  const body = clampProgress((progress - .58) / .42);

  stage.style.setProperty("--stage-opacity", progress.toFixed(4));
  stage.style.setProperty("--stage-shift-x", `${(-22 * (1 - progress)).toFixed(2)}px`);
  stage.style.setProperty("--stage-shift-y", `${(22 * (1 - progress)).toFixed(2)}px`);
  stage.style.setProperty("--stage-scale", (.95 + .05 * progress).toFixed(4));
  stage.style.setProperty("--node-opacity", node.toFixed(4));
  stage.style.setProperty("--node-scale", (.45 + .55 * node).toFixed(4));
  stage.style.setProperty("--visual-opacity", visual.toFixed(4));
  stage.style.setProperty("--visual-shift", `${(18 * (1 - visual)).toFixed(2)}px`);
  stage.style.setProperty("--visual-scale", (.92 + .08 * visual).toFixed(4));
  stage.style.setProperty("--image-opacity", visual.toFixed(4));
  stage.style.setProperty("--vector-opacity", vector.toFixed(4));
  stage.style.setProperty("--copy-opacity", title.toFixed(4));
  stage.style.setProperty("--copy-shift", `${(16 * (1 - title)).toFixed(2)}px`);
  stage.style.setProperty("--title-opacity", title.toFixed(4));
  stage.style.setProperty("--body-opacity", body.toFixed(4));
  stage.dataset.stageProgress = progress.toFixed(4);
}

export function DeliveryJourney() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const map = section.querySelector<HTMLElement>("[data-journey-map]");
    const stageElements = Array.from(section.querySelectorAll<HTMLElement>("[data-journey-stage]"));
    if (!map || stageElements.length !== stages.length) return;

    const eligibility = matchMedia("(min-width: 1024px) and (min-height: 700px) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let inViewport = false;

    const updateAmbientState = () => {
      map.dataset.ambientActive = String(inViewport && !document.hidden && !reducedMotion.matches);
    };

    const update = ({ height, header }: { height: number; header: number }) => {
      section.style.setProperty("--journey-top", `${header}px`);
      section.style.setProperty("--journey-height", `${Math.max(0, height - header)}px`);

      if (reducedMotion.matches) {
        section.dataset.journeyEnabled = "false";
        section.dataset.journeyMode = "static";
        map.style.setProperty("--journey-progress", "1");
        map.style.setProperty("--line-progress", "1");
        map.style.setProperty("--arrow-progress", "1");
        stageElements.forEach(stage => applyStageProgress(stage, 1));
      } else if (eligibility.matches) {
        const rect = section.getBoundingClientRect();
        const availableDistance = Math.max(1, rect.height - height + header - 120);
        const travelDistance = availableDistance * .78;
        const progress = clampProgress((header - rect.top) / travelDistance);

        section.dataset.journeyEnabled = "true";
        section.dataset.journeyMode = "sticky";
        map.style.setProperty("--journey-progress", progress.toFixed(4));
        map.style.setProperty("--line-progress", clampProgress(progress / .88).toFixed(4));
        map.style.setProperty("--arrow-progress", clampProgress((progress - .90) / .10).toFixed(4));
        stageElements.forEach((stage, index) => {
          const [start, end] = ranges[index];
          applyStageProgress(stage, clampProgress((progress - start) / (end - start)));
        });
      } else {
        section.dataset.journeyEnabled = "false";
        section.dataset.journeyMode = "flow";
        const localProgress = stageElements.map((stage, index) => {
          const rect = stage.getBoundingClientRect();
          const startLine = height * (.86 - index * .045);
          const endLine = height * .50;
          const progress = clampProgress((startLine - rect.top) / Math.max(1, startLine - endLine));
          applyStageProgress(stage, progress);
          return progress;
        });
        const progress = localProgress.reduce((furthest, stageProgress, index) => {
          return Math.max(furthest, stageProgress > 0 ? (index + stageProgress) / stages.length : 0);
        }, 0);
        map.style.setProperty("--journey-progress", progress.toFixed(4));
        map.style.setProperty("--line-progress", "1");
        map.style.setProperty("--arrow-progress", "1");
      }

      section.dataset.journeyEnhanced = "true";
      updateAmbientState();
    };

    const unsubscribe = subscribeScrollFrame(update);
    const resize = new ResizeObserver(scheduleScrollFrame);
    resize.observe(section);
    stageElements.forEach(stage => resize.observe(stage));

    const intersection = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting;
      updateAmbientState();
    }, { rootMargin: "160px 0px" });
    intersection.observe(section);

    const onPreferenceChange = () => {
      updateAmbientState();
      scheduleScrollFrame();
    };
    const onVisibilityChange = () => {
      updateAmbientState();
      if (!document.hidden) scheduleScrollFrame();
    };

    eligibility.addEventListener("change", scheduleScrollFrame);
    reducedMotion.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      unsubscribe();
      resize.disconnect();
      intersection.disconnect();
      eligibility.removeEventListener("change", scheduleScrollFrame);
      reducedMotion.removeEventListener("change", onPreferenceChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return <section ref={sectionRef} className={styles.section} aria-labelledby="delivery-heading" data-testid="solutions-journey">
    <div className={styles.sticky}>
      <div className={styles.container}>
        <div className={styles.intro}>
          <h2 id="delivery-heading">A solution creates value when it can be put into practice.</h2>
          <p>CrimsonTide can take a defined direction beyond the concept stage and prepare it to work where it will be used.</p>
        </div>

        <div className={styles.map} data-journey-map data-ambient-active="false">
          <svg className={styles.route} viewBox="0 0 1200 590" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="solutionsJourneyLine" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0" stopColor="#ff9aa1" />
                <stop offset=".22" stopColor="#ef3340" />
                <stop offset=".72" stopColor="#ff5963" />
                <stop offset="1" stopColor="#ffb1b6" />
              </linearGradient>
              <filter id="solutionsJourneyGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <path className={styles.routeGlow} pathLength="1" d="M18 540 L250 460 C270 453 282 451 305 451 L455 451 C485 451 500 390 535 345 C548 330 560 324 585 324 L760 324 C790 324 805 260 840 215 C852 202 865 196 890 196 L1070 196 C1095 196 1103 168 1120 145 L1176 70" />
            <path className={styles.routeLine} pathLength="1" d="M18 540 L250 460 C270 453 282 451 305 451 L455 451 C485 451 500 390 535 345 C548 330 560 324 585 324 L760 324 C790 324 805 260 840 215 C852 202 865 196 890 196 L1070 196 C1095 196 1103 168 1120 145 L1176 70" />
            <circle className={styles.routeStart} cx="18" cy="540" r="4" />
            <path className={styles.arrowGlow} pathLength="1" d="M1145 89 L1176 70 L1171 106" />
            <path className={styles.arrow} pathLength="1" d="M1145 89 L1176 70 L1171 106" />
          </svg>

          {stages.map((stage, index) => <article key={stage.title} className={`${styles.stage} ${stage.className}`} data-journey-stage>
            <div className={styles.visualReveal} aria-hidden="true">
              <div className={styles.visual}>
                <span className={`${styles.ring} ${styles.ringA}`} />
                <span className={`${styles.ring} ${styles.ringB}`} />
                <span className={`${styles.particle} ${styles.particleA}`} />
                <span className={`${styles.particle} ${styles.particleB}`} />
                <span className={styles.imageFrame}>
                  <Image src={stage.image} alt="" fill sizes="(max-width: 767px) 104px, 154px" loading="lazy" />
                </span>
              </div>
            </div>
            <span className={styles.node} aria-hidden="true"><i /></span>
            <div className={styles.copy}>
              <p className={styles.number}>0{index + 1}</p>
              <h3>{stage.title}</h3>
              <p className={styles.emphasis}>{stage.emphasis}</p>
              <p className={styles.body}>{stage.body}</p>
            </div>
          </article>)}
        </div>
      </div>
    </div>
  </section>;
}
