import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { CaseIllustration } from "./CaseIllustration";
import styles from "./HomeSections.module.css";

export function Experience() {
  return <section className={`${styles.section} ${styles.experience}`} aria-labelledby="experience-heading">
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <SectionLabel>Experience in action</SectionLabel>
        <h2 id="experience-heading">Technology applied in real-world environments.</h2>
        <p>Our products and solutions are built to work beyond the concept stage — across real organisations, operations, and challenges.</p>
      </Reveal>
      <div className={styles.case} data-case-scene>
        <CaseIllustration />
        <Reveal className={styles.caseCopy}>
          <SectionLabel>Featured case · Retail</SectionLabel>
          <h3>General Food Supermarket — Liguanea</h3>
          <p>CrimsonTide implemented AI-enabled camera technology across operational areas of the supermarket to support security, loss prevention, and operational analysis.</p>
          <p>The implementation included cashier zones and analytical capabilities designed to provide greater visibility into activity, behaviour, and operational patterns.</p>
          <ActionLink href="/work#work-cases">View case study</ActionLink>
        </Reveal>
      </div>
      <Reveal className={styles.trust}>
            <p>Organisations that form part of CrimsonTide&apos;s experience</p>
            <ul>
              <li>Guardsman Group</li>
              <li>General Food Supermarket</li>
              <li>Beryllium</li>
            </ul>
            <ActionLink href="/work" variant="text">Explore our work</ActionLink>
      </Reveal>
    </div>
  </section>;
}
