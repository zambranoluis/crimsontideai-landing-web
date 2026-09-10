import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Process.module.css";

const steps = [
  {
    title: "Discover",
    body: "We explore the objectives, context, and relevant needs to identify what the solution should solve or create.",
    icon: "/icons/discover.svg",
  },
  {
    title: "Design",
    body: "We design how the solution should work and determine the role artificial intelligence could play within it.",
    icon: "/icons/design.svg",
  },
  {
    title: "Prototype & Validate",
    body: "We build prototypes of the idea or a workable version, test in real situations to evaluate the approach, learn, and validate decisions before moving forward.",
    icon: "/icons/prototype.svg",
  },
  {
    title: "Implement & Integrate",
    body: "We build and implement the solution, connecting it with the systems, processes, or environments required by the scope of the project.",
    icon: "/icons/implement.svg",
  },
  {
    title: "Evolve",
    body: "The solution can be refined, expanded, and evolved as the organisation learns from real use and its needs change.",
    icon: "/icons/evolve.svg",
  },
] as const;

export function Process() {
  return <section className={styles.section} aria-labelledby="process-heading">
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <p className={styles.eyebrow}>How we work</p>
        <h2 id="process-heading">From a clear objective to a solution that can be put into practice.</h2>
        <p>We work from the initial understanding of a need through to building and implementing a solution, shaping each stage around what the project actually requires.</p>
      </Reveal>
      <ol className={styles.steps}>
        {steps.map((step, index) => <Reveal key={step.title} className={`${styles.step} ${styles[`step${index + 1}`]}`} delayMs={index * 40}>
          <li>
            <span className={styles.icon} aria-hidden="true"><Image src={step.icon} alt="" width={48} height={48} /></span>
            <p className={styles.number}>0{index + 1}</p>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </li>
        </Reveal>)}
      </ol>
    </div>
  </section>;
}
