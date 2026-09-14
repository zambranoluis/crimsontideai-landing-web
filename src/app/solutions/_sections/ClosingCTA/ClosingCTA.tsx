import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { EarthGlow } from "./EarthGlow";
import styles from "./ClosingCTA.module.css";

export function ClosingCTA() {
  return <EarthGlow className={styles.closing}>
    <div className={styles.scene} data-earth-scene>
      <div className={styles.copy} data-earth-copy>
        <h1 id="solutions-closing-title">AI solutions and<br /> custom software<br /> built around your <span>objectives.</span></h1>
        <p>Whether you want to solve a challenge, improve how something works, or develop a new capability, CrimsonTide can start by understanding the objective and the context around it.</p>
        <ActionLink href="/contact" variant="primary">Discuss an AI solution</ActionLink>
      </div>
      <div className={styles.artworkTrack} data-earth-artwork-track>
      <div className={styles.earth} aria-hidden="true" data-earth-art>
        <div className={styles.plane}>
          <Image className={styles.planet} src="/pages/ai-solutions/images/planet-isolated.png" alt="" width={1778} height={1000} loading="eager" fetchPriority="high" unoptimized />
          <div className={styles.atmosphere} data-earth-atmosphere />
          <Image className={styles.glow} data-earth-glow src="/pages/ai-solutions/images/glow-overlay.png" alt="" width={1778} height={1000} loading="eager" unoptimized />
        </div>
      </div>
      </div>
    </div>
  </EarthGlow>;
}
