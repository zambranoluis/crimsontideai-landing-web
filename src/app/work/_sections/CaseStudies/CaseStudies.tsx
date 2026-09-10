import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./CaseStudies.module.css";

export function CaseStudies() {
  return <section id="work-cases" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2>From real-world context to applied technology.</h2>
        <p>Explore how CrimsonTide approaches specific needs and brings products and technology solutions into real operational environments.</p>
      </Reveal>
      <div className={styles.item}>
        <Reveal><p className={styles.kicker}>Retail - Implementation</p><h3>General Food Supermarket - Liguanea</h3></Reveal>
        <Reveal><h4>Context</h4><p>CrimsonTide worked with General Food Supermarket in Liguanea on an AI-enabled camera technology implementation designed to support security, loss prevention, and greater visibility across operations. The implementation covered operational areas of the supermarket, including cashier zones, where day-to-day activity requires a combination of security, oversight, and understanding of operational patterns.</p></Reveal>
        <Reveal><h4>Applied technology</h4><p>AI-enabled cameras and analytical capabilities were introduced to observe activity, behaviour, and patterns across the supermarket environment.</p></Reveal>
        <Reveal><h4>Operational objectives</h4><ul><li>Support loss prevention and security.</li><li>Increase visibility into activity and operational patterns.</li><li>Provide useful information to support decisions related to operations and customer experience.</li></ul></Reveal>
      </div>
    </div>
  </section>;
}
