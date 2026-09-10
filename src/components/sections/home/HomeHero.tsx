import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";
import { ScrollArtwork } from "./ScrollArtwork";
import { HeroMesh } from "./HeroMesh";
import styles from "./HomeSections.module.css";

export function HomeHero() {
  return <section className={styles.hero} aria-labelledby="home-heading">
    <ScrollArtwork><HeroMesh /></ScrollArtwork>
    <div className={styles.container}>
      <div className={styles.heroCopy}>
        <SectionLabel>AI software company, built in Jamaica.</SectionLabel>
        <h1 id="home-heading">We build software products and solutions for real-world problems<span className={styles.period}>.</span>
        </h1>
        <p className={styles.lead}>CrimsonTide develops proprietary AI products and works with organisations to design, build, adapt, and implement software around specific needs.</p>
        <ActionLink href="#home-build" variant="primary" down>Explore what we build</ActionLink>
      </div>
    </div>
  </section>;
}
