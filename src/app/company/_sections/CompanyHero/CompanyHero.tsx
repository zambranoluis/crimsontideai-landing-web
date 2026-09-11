import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import styles from "./CompanyHero.module.css";

export function CompanyHero() {
  return <section className={styles.hero} aria-labelledby="company-heading">
    <Image className={styles.artwork} src="/pages/company/company/images/company-hero.png" alt="" fill sizes="100vw" preload />
    <div className={styles.container}><div className={styles.copy}>
      <h1 id="company-heading">We turn possibilities into technology that can move forward.</h1>
      <p>CrimsonTide is a software and artificial intelligence company developing proprietary products and solutions around real needs, combining technological capability, vision, and a perspective built from Jamaica.</p>
      <ActionLink href="#company-about" variant="primary" down>Discover CrimsonTide</ActionLink>
    </div></div>
  </section>;
}
