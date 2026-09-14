import { CompanyRadar } from "../../_components/CompanyRadar";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import styles from "./CompanyHero.module.css";

export function CompanyHero() {
  return <section className={styles.hero} aria-labelledby="company-heading">
    <CompanyRadar />
    <div className={styles.container}><div className={styles.copy}>
      <h1 id="company-heading">A Jamaica-built AI software company, moving possibilities forward.</h1>
      <p>CrimsonTide develops proprietary products, AI solutions, and custom software around real needs, combining technical capability with a perspective built from Jamaica.</p>
      <ActionLink href="#company-about" variant="primary" down>Discover CrimsonTide</ActionLink>
    </div></div>
  </section>;
}
