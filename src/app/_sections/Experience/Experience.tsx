import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { WarehouseVideo } from "./WarehouseVideo";
import styles from "./Experience.module.css";

export function Experience() {
  return <section id="home-experience" className={`${styles.section} ${styles.experience}`} aria-labelledby="experience-heading">
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2 id="experience-heading">Technology applied in real-world environments.</h2>
        <p>Our products and solutions are built to work beyond the concept stage — across real organisations, operations, and challenges.</p>
      </Reveal>
      <div className={styles.experienceGrid}>
        <Reveal className={styles.case}>
          <div className={styles.caseCopy}>
            <h3>General Food Supermarket — Liguanea</h3>
            <p>CrimsonTide implemented AI-enabled camera technology across operational areas of the supermarket to support security, loss prevention, and operational analysis.</p>
            <p>The implementation included cashier zones and analytical capabilities designed to provide greater visibility into activity, behaviour, and operational patterns.</p>
            <ActionLink href="/work#work-cases" variant="primary">View case study</ActionLink>
          </div>
          <WarehouseVideo />
        </Reveal>
        <Reveal className={styles.trust}>
          <p>Organisations that form part of CrimsonTide&apos;s experience</p>
          <ul>
            <li>Guardsman Group</li>
            <li>General Food Supermarket</li>
            <li>Beryllium</li>
          </ul>
          <ActionLink href="/work#work-industries">Explore our work</ActionLink>
        </Reveal>
      </div>
    </div>
  </section>;
}
