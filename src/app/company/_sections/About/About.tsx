import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./About.module.css";

const principles = [
  { title: "We build proprietary technology", body: "We develop products and technological capabilities within CrimsonTide, building knowledge and experience that can evolve with every new challenge." },
  { title: "We build around context", body: "When a need requires something different, we can design, adapt, or develop technology around an organisation's objectives, processes, and environment." },
  { title: "We carry ideas into use", body: "Our work spans from defining what is worth building to developing, integrating, and implementing solutions that can become part of real operations." },
] as const;

export function About() {
  return <section id="company-about" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2>We build technology to take ideas beyond intention.</h2>
        <p>CrimsonTide combines proprietary product development with software and artificial intelligence solutions for organisations looking to turn objectives, processes, and opportunities into technology that can be used in the real world.</p>
        <p>Our capability does not begin or end with a single platform. We design products, develop software, apply artificial intelligence where it adds value, and work through to integrating technology within the context where it needs to perform.</p>
      </Reveal>
      <div className={styles.threeItems}>{principles.map((principle, index) => <Reveal key={principle.title} className={styles.item} delayMs={index * 80}>
        <span className={styles.index}>0{index + 1}</span><h3>{principle.title}</h3><p>{principle.body}</p>
      </Reveal>)}</div>
    </div>
  </section>;
}
