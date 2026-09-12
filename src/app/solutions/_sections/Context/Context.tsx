import { Reveal } from "@/components/ui/Reveal/Reveal";
import { ContextHologram } from "./ContextHologram";
import styles from "./Context.module.css";

const context = [
  { title: "Your Objective", kicker: "Start with what you want to achieve.", body: "We define the purpose of the solution around the outcome, improvement, or new capability you want to develop.", icon: "/icons/objective.svg" },
  { title: "Your Environment", kicker: "Understand where it needs to work.", body: "We consider the relevant processes, systems, and conditions that shape the environment in which the solution will operate.", icon: "/icons/company.svg" },
  { title: "Your Solution", kicker: "Build around those needs.", body: "From that context, we define a solution that brings together the right technology and capabilities for the scope of the project.", icon: "/icons/your-solutions.svg" },
] as const;

export function Context() {
  return <section className={styles.section} aria-labelledby="context-heading">
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2 id="context-heading">The solution should adapt to your organisation, not the other way around.</h2>
        <p>Every project starts with different objectives, ways of working, and conditions. We design around that reality so the technology responds to what the organisation actually needs.</p>
      </Reveal>
      <Reveal className={styles.hologramReveal}>
        <ContextHologram items={context} />
      </Reveal>
    </div>
  </section>;
}
