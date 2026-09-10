import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { ScrollArtwork } from "./ScrollArtwork";
import { HeroArtwork } from "./HeroArtwork";
import styles from "./HomeHero.module.css";

export function HomeHero() {
  return <section className={styles.hero} aria-labelledby="home-heading">
    <ScrollArtwork><HeroArtwork /></ScrollArtwork>
    <div className={styles.container}>
      <div className={styles.heroCopy}>
        <h1 id="home-heading">We build software products and solutions for real-world problems<span className={styles.period}>.</span>
        </h1>
        <p className={styles.lead}>CrimsonTide develops proprietary AI products and works with organisations to design, build, adapt, and implement software around specific needs.</p>
        <ActionLink href="#home-build" variant="primary" down>Explore what we build</ActionLink>
      </div>
    </div>
  </section>;
}
