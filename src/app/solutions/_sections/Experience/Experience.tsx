import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Experience.module.css";

export function Experience() {
  return <section className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2>Solutions built to work in real-world environments.</h2>
        <p>Our experience includes projects where artificial intelligence and software have moved beyond the concept stage and into real operations.</p>
      </Reveal>
      <Reveal className={styles.item}>
        <p className={styles.kicker}>Featured Case - Retail</p>
        <h3>General Food Supermarket - Liguanea</h3>
        <p>CrimsonTide implemented AI-enabled camera technology across operational areas of the supermarket to support security, loss prevention, and operational analysis.</p>
        <p>The implementation included cashier zones and analytical capabilities designed to provide greater visibility into activity, behaviour, and operational patterns.</p>
        <ActionLink href="/work#work-cases">View case study</ActionLink>
      </Reveal>
      <Reveal className={styles.outro}>
        <p>Organisations that form part of CrimsonTide&apos;s experience: Guardsman Group, General Food Supermarket, and Beryllium.</p>
      </Reveal>
    </div>
  </section>;
}
