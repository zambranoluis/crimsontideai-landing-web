import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { Orbit } from "./Orbit";
import styles from "./ClosingCTA.module.css";

export function ClosingCTA() {
  return <section className={styles.section} aria-labelledby="work-closing-heading" data-testid="work-closing">
    <Image className={styles.background} src="/pages/work-and-credibility/images/experience-work.png" alt="" fill sizes="100vw" />
    <div className={styles.overlay} />
    <div className={styles.container}>
      <Reveal className={styles.copy}>
        <h2 id="work-closing-heading">Turn experience into what comes next.</h2>
        <p>Whether you are exploring a new opportunity, expanding capabilities, or looking for technology built around a specific context, let&apos;s discuss what CrimsonTide can build with you.</p>
        <ActionLink href="/contact" variant="primary">Contact CrimsonTide</ActionLink>
      </Reveal>
      <Orbit />
    </div>
  </section>;
}
