import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./SentinelShowcase.module.css";
import { SentinelPreview } from "./SentinelPreview";
import { ProductsMesh } from "../../_components/ProductsMesh";
import { ProductScene } from "../../_components/ProductScene";
import { ProductIcon } from "../../_components/ProductIcon";

const points = [
  ["Detect what matters", "Analyse video to identify events, behaviours, and situations that require attention."],
  ["Move from observation to action", "Turn detected activity into alerts and information that help teams respond more quickly."],
  ["Gain greater operational visibility", "Use intelligence from your cameras to better understand activity, patterns, and conditions across your operations."],
] as const;

export function SentinelShowcase() {
  return <section id="products-sentinel" className={styles.showcase} aria-labelledby="sentinel-heading">
    <ProductsMesh variant="sentinel" />
    <div className={styles.container}>
      <ProductScene product="sentinel" preview={<SentinelPreview />} introduction={
        <div className={styles.copy}>
          <Reveal>
            <p className={styles.productBrand}>
              <Image className={styles.productWordmark} src="/logos/sentinel-words.svg" alt="Sentinel" width={880} height={167} />
            </p>
            <h2 id="sentinel-heading">See more.<br /><span className={styles.accent}>Act sooner.</span></h2>
          </Reveal>
          <Reveal delayMs={80}><p className={styles.description}>Sentinel turns existing camera networks into an active source of detection and intelligence. Using computer vision, it helps identify relevant situations, generate alerts, and provide greater visibility across security and operations so teams can respond and make decisions with more context.</p></Reveal>
        </div>
      }>
          {points.map(([title, description], index) => <li key={title} data-feature-step={index}>
            <Reveal className={styles.feature}>
              <span className={styles.pointIcon}><ProductIcon name={(["detection", "alert", "analytics"] as const)[index]} /></span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </Reveal>
          </li>)}
      </ProductScene>
      <div className={styles.productEnd}>
        <p><span className={styles.endIcon}><ProductIcon name="shield" /></span>Designed to work with existing camera infrastructure and adapt to different deployment environments.</p>
        <ActionLink href="https://crimsontide.app" variant="primary">Explore Sentinel</ActionLink>
      </div>
    </div>
  </section>;
}
