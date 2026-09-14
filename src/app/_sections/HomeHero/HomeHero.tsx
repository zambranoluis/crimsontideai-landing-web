import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { JamaicaNetwork } from "./JamaicaNetwork";
import styles from "./HomeHero.module.css";

export function HomeHero() {
  return <section className={styles.hero} aria-labelledby="home-heading">
    <div className={styles.artwork} data-testid="hero-artwork" aria-hidden="true"><JamaicaNetwork /></div>
    <div className={styles.container}>
      <div className={styles.heroCopy}>
        <h1 id="home-heading">AI software products and solutions, built in Jamaica<span className={styles.period}>.</span>
        </h1>
        <p className={styles.lead}>CrimsonTide is an AI software company in Jamaica, developing proprietary products, AI solutions, and custom software around specific organisational needs.</p>
        <ActionLink href="#home-build" variant="primary" down>Explore what we build</ActionLink>
      </div>
    </div>
  </section>;
}
