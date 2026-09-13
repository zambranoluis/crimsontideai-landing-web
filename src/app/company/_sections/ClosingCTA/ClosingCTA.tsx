import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import Image from "next/image";
import styles from "./ClosingCTA.module.css";

export function ClosingCTA() {
  return <section className={styles.section} aria-labelledby="company-closing">
    <Image className={styles.artwork} src="/pages/company/images/company-hero.png" alt="" fill sizes="100vw" />
    <div className={styles.container}><Reveal className={styles.copy}>
      <h2 id="company-closing">Let&apos;s talk about what comes next.</h2>
      <p>If you are exploring an opportunity, a technology need, or a new initiative, our team can help determine where CrimsonTide can add value.</p>
      <ActionLink href="/contact" variant="primary">Contact CrimsonTide</ActionLink>
    </Reveal></div>
  </section>;
}
