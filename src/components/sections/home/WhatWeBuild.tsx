import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { OpenJMVisual, SentinelVisual } from "./ProductVisuals";
import styles from "./HomeSections.module.css";

const offerings = [
  ["AI Solutions", "Applied artificial intelligence designed around specific business or operational problems."],
  ["Custom Software Development", "Software built around specific workflows, requirements, and needs."],
  ["Product Customisation", "Existing CrimsonTide products adapted to create more specific experiences for each implementation."],
  ["Integrations & Deployments", "Technology integrated, implemented, and deployed within existing systems and environments."],
];

export function WhatWeBuild() {
  return <section id="home-build" className={styles.section} aria-labelledby="build-heading">
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <SectionLabel>What we build</SectionLabel>
        <h2 id="build-heading">Proprietary products. Solutions for specific needs.</h2>
        <p>CrimsonTide works across two paths: we develop software products for defined problems, and we work with organisations to design, adapt, and implement technology around their objectives.</p>
      </Reveal>
      <Reveal>
        <div className={styles.productIntro}>
          <h3>Products</h3>
          <p>Independent products developed by CrimsonTide for different problems and audiences.</p>
        </div>
      </Reveal>
      <div className={styles.products}>
        <Reveal className={styles.product}>
          <article>
            <div className={styles.productCopy}>
              <div className={styles.productTitle}>
                <span className={styles.productDot} />
                <h3>OpenJM</h3>
              </div>
              <p>Conversational AI for working with questions, information, files, and tasks through natural language.</p>
              <ActionLink href="/products#products-openjm" variant="text">Explore OpenJM</ActionLink>
            </div>
            <OpenJMVisual />
          </article>
        </Reveal>
        <Reveal className={styles.product}>
          <article>
            <div className={styles.productCopy}>
              <div className={styles.productTitle}>
                <span className={styles.sentinelDot} />
                <h3>Sentinel</h3>
              </div>
              <p>Computer vision that turns existing camera networks into detection, alerts, and actionable information for security and operations.</p>
              <ActionLink href="/products#products-sentinel" variant="text">Explore Sentinel</ActionLink>
            </div>
            <SentinelVisual />
          </article>
        </Reveal>
      </div>
      <Reveal className={styles.solutions}>
        <div className={styles.solutionIntro}>
          <h3>AI &amp; Software Solutions</h3>
          <p>When a need requires something more specific, CrimsonTide can design and build technology around the organisation&apos;s context.</p>
          <ActionLink href="/solutions">Explore Solutions</ActionLink>
        </div>
        <div className={styles.offerings}>{offerings.map(([title, description], i) => <div className={styles.offering} key={title}>
          <span className={styles.offeringIcon} aria-hidden="true">{["✳", "〈〉", "≡", "↗"][i]}</span>
          <div>
            <h4>{title}</h4>
            <p>{description}</p>
          </div>
        </div>)}</div>
      </Reveal>
    </div>
  </section>;
}
