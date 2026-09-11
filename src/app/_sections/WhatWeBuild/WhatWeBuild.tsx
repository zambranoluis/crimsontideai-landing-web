import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { ProductCard } from "./ProductCard";
import styles from "./WhatWeBuild.module.css";

const offerings = [
  ["AI Solutions", "Applied artificial intelligence designed around specific business or operational problems.", "/icons/Ia-solutions.svg"],
  ["Custom Software Development", "Software built around specific workflows, requirements, and needs.", "/icons/dev-solutions.svg"],
  ["Product Customisation", "Existing CrimsonTide products adapted to create more specific experiences for each implementation.", "/icons/customization.svg"],
  ["Integrations & Deployments", "Technology integrated, implemented, and deployed within existing systems and environments.", "/icons/deployments.svg"],
];

export function WhatWeBuild() {
  return <section id="home-build" className={styles.section} aria-labelledby="build-heading">
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2 id="build-heading">Proprietary products. Solutions for specific needs.</h2>
        <p>CrimsonTide works across two paths: we develop software products for defined problems, and we work with organisations to design, adapt, and implement technology around their objectives.</p>
      </Reveal>
      <div className={styles.buildPanels}>
        <Reveal className={`${styles.buildPanel} ${styles.productsPanel}`}>
          <div className={styles.panelHeader}>
            <img className={styles.panelIcon} src="/icons/products.svg" alt="" aria-hidden="true" />
            <div>
              <h3>Products</h3>
              <p>Independent products developed by CrimsonTide for different problems and audiences.</p>
            </div>
          </div>
          <div className={styles.productCards}>
            <ProductCard>
              <div className={styles.logoFrame}>
                <img className={styles.productLogo} src="/logos/openjm-full.svg" alt="OpenJM" />
              </div>
              <p>Conversational AI for working with questions, information, files, and tasks through natural language.</p>
              <ActionLink href="/products#products-openjm" variant="text">Explore OpenJM</ActionLink>
            </ProductCard>
            <ProductCard>
              <div className={styles.logoFrame}>
                <img className={styles.productLogo} src="/logos/sentinel-full.svg" alt="Sentinel" />
              </div>
              <p>Computer vision that turns existing camera networks into detection, alerts, and actionable information for security and operations.</p>
              <ActionLink href="/products#products-sentinel" variant="text">Explore Sentinel</ActionLink>
            </ProductCard>
          </div>
        </Reveal>
        <Reveal className={`${styles.buildPanel} ${styles.solutionsPanel}`} delayMs={80}>
          <div className={styles.panelHeader}>
            <img className={styles.panelIcon} src="/icons/solotions.svg" alt="" aria-hidden="true" />
            <div>
              <h3>AI &amp; Software Solutions</h3>
              <p>When a need requires something more specific, CrimsonTide can design and build technology around the organisation&apos;s context.</p>
            </div>
          </div>
          <div className={styles.offerings}>{offerings.map(([title, description, icon]) => <div className={styles.offering} key={title}>
            <img className={styles.offeringIcon} src={icon} alt="" aria-hidden="true" />
            <div>
              <h4>{title}</h4>
              <p>{description}</p>
            </div>
          </div>)}</div>
          <ActionLink href="/solutions">Explore Solutions</ActionLink>
        </Reveal>
      </div>
    </div>
  </section>;
}
