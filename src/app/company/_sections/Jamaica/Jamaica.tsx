import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Jamaica.module.css";

const statements = [
  { icon: "target", text: "Founded in Jamaica" },
  { icon: "jamaica-map", text: "Developing technology from the Caribbean" },
  { icon: "propietary-technology", text: "Proprietary products, software & solutions" },
  { icon: "world", text: "For organisations worldwide" },
] as const;

export function Jamaica() {
  return <section id="company-jamaica" className={styles.section}>
    <div className={styles.artwork} aria-hidden="true"><Image src="/pages/company/images/company-tecnology.png" alt="" fill sizes="100vw" loading="eager" /></div>
    <div className={styles.container}>
      <Reveal className={styles.copy}>
        <h2>Technology developed from Jamaica and the Caribbean.</h2>
        <p>CrimsonTide is a software and artificial intelligence company founded in Jamaica. From the Caribbean, we develop proprietary products, software, and technology solutions for organisations with different needs, operations, and environments.</p>
      </Reveal>
      <ul className={styles.statements}>{statements.map(({ icon, text }) => <li key={icon}>
        <span className={styles.icon}><Image src={`/icons/${icon}.svg`} alt="" width={40} height={40} /></span>
        <p>{text}</p>
      </li>)}</ul>
    </div>
  </section>;
}
