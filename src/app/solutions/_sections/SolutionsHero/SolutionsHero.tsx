import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./SolutionsHero.module.css";

export function SolutionsHero() {
  return <section className={styles.hero} aria-labelledby="solutions-heading" data-testid="solutions-hero">
    <Image
      className={styles.artwork}
      src="/images/solutions/solution-hero.png"
      alt=""
      width={1672}
      height={941}
      sizes="100vw"
      loading="eager"
      fetchPriority="high"
    />
    <div className={styles.scrim} aria-hidden="true" />
    <div className={styles.container}>
      <Reveal className={styles.copy}>
        <h1 id="solutions-heading">Artificial intelligence designed around your objectives<span>.</span></h1>
        <p>When a need calls for something more specific, CrimsonTide works with organisations to design, build, and implement AI solutions around their context, workflows, and objectives.</p>
        <ActionLink href="/contact" variant="primary">Discuss an AI solution</ActionLink>
      </Reveal>
    </div>
  </section>;
}
