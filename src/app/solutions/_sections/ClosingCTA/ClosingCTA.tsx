import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { EarthGlow } from "./EarthGlow";
import styles from "./ClosingCTA.module.css";

export function ClosingCTA() {
  return <EarthGlow className={styles.closing}>
    <div className={styles.scene} data-earth-scene>
      <div className={styles.copy} data-earth-copy>
        <h2 id="solutions-closing-title">Tell us what you<br /> want to <span>achieve.</span><br /> Let&apos;s build the path<br /> to make it possible.</h2>
        <p>Whether you want to solve a challenge, improve how something works, or develop a new capability, we can start by understanding the objective.</p>
        <ActionLink href="/contact" variant="primary">Discuss an AI solution</ActionLink>
      </div>
      <div className={styles.earth} aria-hidden="true" data-earth-art>
        <div className={styles.plane}>
          <Image className={styles.planet} src="/pages/ai-solutions/planet-isolated.png" alt="" width={1778} height={1000} unoptimized />
          <div className={styles.atmosphere} data-earth-atmosphere />
          <Image className={styles.glow} data-earth-glow src="/pages/ai-solutions/glow-overlay.png" alt="" width={1778} height={1000} unoptimized />
        </div>
      </div>
    </div>
  </EarthGlow>;
}
