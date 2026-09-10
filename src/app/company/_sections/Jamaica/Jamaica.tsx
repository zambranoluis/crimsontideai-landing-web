import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Jamaica.module.css";

export function Jamaica() {
  return <section id="company-jamaica" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.copy}>
        <h2>Technology developed from Jamaica and the Caribbean.</h2>
        <p>CrimsonTide is a software and artificial intelligence company founded in Jamaica. From the Caribbean, we develop proprietary products, software, and technology solutions for organisations with different needs, operations, and environments.</p>
      </Reveal>
    </div>
  </section>;
}
