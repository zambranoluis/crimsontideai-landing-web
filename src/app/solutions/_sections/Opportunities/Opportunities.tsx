import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Opportunities.module.css";

const opportunities = [
  { title: "Solve a specific challenge", body: "Explore how artificial intelligence can become part of a solution designed around a specific business or operational need.", icon: "/icons/target.svg", motion: "target" },
  { title: "Improve how work gets done", body: "Identify opportunities to reduce friction, support decisions, and improve existing processes through artificial intelligence capabilities.", icon: "/icons/progress.svg", motion: "progress" },
  { title: "Create a new capability", body: "Develop new tools, experiences, or ways of working that expand what your organisation can do.", icon: "/icons/new-capability.svg", motion: "capability" },
] as const;

export function Opportunities() {
  return <section className={styles.section} aria-labelledby="opportunities-heading">
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2 id="opportunities-heading">We start with what you want to achieve, not the technology.</h2>
        <p>Every organisation starts from a different context. An AI solution can begin with a challenge that needs to be addressed, a process that could work better, or a new capability you want to develop.</p>
      </Reveal>
      <div className={styles.opportunities}>
        {opportunities.map((item, index) => <Reveal key={item.title} className={styles.cardReveal} delayMs={index * 80}>
          <div className={styles.card} data-opportunity-card={index + 1} data-icon-motion={item.motion}>
            <span className={styles.icon} aria-hidden="true"><Image src={item.icon} alt="" width={54} height={54} /></span>
            <span className={styles.rule} aria-hidden="true" />
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </div>
        </Reveal>)}
      </div>
    </div>
  </section>;
}
