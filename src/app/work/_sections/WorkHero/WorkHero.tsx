import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { Orbit } from "./Orbit";
import styles from "./WorkHero.module.css";

export function WorkHero() {
  return <section className={styles.hero} aria-labelledby="work-heading" data-testid="work-hero">
    <Image
      className={styles.background}
      src="/pages/work-and-credibility/images/experience-work.png"
      alt=""
      fill
      preload
      fetchPriority="high"
      sizes="100vw"
    />
    <div className={styles.overlay} />
    <div className={styles.container}>
      <Reveal className={styles.copy}>
        <h1 id="work-heading">Experience is proven in practice<span className={styles.accent}>.</span></h1>
        <p>Explore projects, industries, and organisations that form part of CrimsonTide&apos;s track record and show how our technology is applied in real-world contexts.</p>
        <ActionLink href="#work-cases" variant="primary" down>View case studies</ActionLink>
      </Reveal>
      <Orbit />
    </div>
  </section>;
}
