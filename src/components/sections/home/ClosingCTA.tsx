import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./HomeSections.module.css";

export function ClosingCTA() {
  return <section className={styles.closing} aria-labelledby="closing-heading">
    <div className={styles.closingLines} aria-hidden="true">
      <svg viewBox="0 0 1440 650" preserveAspectRatio="none">{Array.from({ length: 20 }, (_, i) => <path key={i} d={`M-100 ${420 + i * 8} Q900 ${1000 - i * 8} 1550 ${-200 + i * 18}`} />)}</svg>
    </div>
    <Reveal className={styles.container}>
      <div className={styles.closingCopy}>
        <SectionLabel>Start a conversation</SectionLabel>
        <h2 id="closing-heading">Take your potential further.</h2>
        <p className={styles.lead}>Build on your strengths and expand your capabilities with products, artificial intelligence, and software designed to unlock new possibilities across your organisation.</p>
        <ActionLink href="/contact" variant="primary">Contact CrimsonTide</ActionLink>
      </div>
    </Reveal>
  </section>;
}
