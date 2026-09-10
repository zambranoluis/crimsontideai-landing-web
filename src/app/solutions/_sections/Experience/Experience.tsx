import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Experience.module.css";

export function Experience() {
  return <section className={styles.section}>
    <div className={styles.container}>
      <div className={styles.showcase}>
        <Reveal className={styles.intro}>
          <h2>Solutions built to work in real-world environments.</h2>
          <p>Our experience includes projects where artificial intelligence and software have moved beyond the concept stage and into real operations.</p>
        </Reveal>
        <Reveal className={styles.media}>
          <Image
            src="/images/solutions/solution-market.png"
            alt="AI-enabled supermarket operations environment"
            fill
            sizes="(max-width: 1023px) calc(100vw - 40px), min(92vw, 1440px)"
            loading="lazy"
          />
        </Reveal>
        <Reveal className={styles.casePanel}>
          <span className={styles.caseIcon} aria-hidden="true"><Image src="/icons/shopping-cart.svg" alt="" width={32} height={32} /></span>
          <p className={styles.kicker}>Featured case · Retail</p>
          <h3>General Food Supermarket - Liguanea</h3>
          <p>CrimsonTide implemented AI-enabled camera technology across operational areas of the supermarket to support security, loss prevention, and operational analysis.</p>
          <p>The implementation included cashier zones and analytical capabilities designed to provide greater visibility into activity, behaviour, and operational patterns.</p>
          <ActionLink href="/work#work-cases" variant="primary">View case study</ActionLink>
        </Reveal>
      </div>
      <Reveal className={styles.proof}>
        <span className={styles.proofIcon} aria-hidden="true"><Image src="/icons/shield-legal-1.svg" alt="" width={31} height={31} /></span>
        <div className={styles.proofIntro}>
          <p className={styles.proofTitle}>Supporting proof</p>
          <p>Organisations that form part of CrimsonTide&apos;s experience</p>
        </div>
        <ul aria-label="Organisations that form part of CrimsonTide's experience">
          <li>Guardsman Group</li>
          <li>General Food Supermarket</li>
          <li>Beryllium</li>
        </ul>
      </Reveal>
    </div>
  </section>;
}
