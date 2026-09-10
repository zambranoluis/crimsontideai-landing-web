import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Clients.module.css";

const clients = [
  { name: "General Food Supermarket", body: "Retail client. CrimsonTide worked with General Food Supermarket in Liguanea on an AI-enabled camera technology implementation designed to support security, loss prevention, and operational visibility." },
  { name: "Guardsman Group", body: "Client relationship." },
  { name: "Beryllium", body: "Client relationship." },
] as const;

export function Clients() {
  return <section id="work-clients" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}><h2>Credibility is also built through real relationships.</h2><p>Organisations and relationships that form part of CrimsonTide&apos;s experience and help demonstrate how our technological capabilities connect with real-world contexts.</p></Reveal>
      <div className={styles.threeItems}>{clients.map(({ name, body }, index) => <Reveal className={styles.item} key={name} delayMs={index * 80}>
        <span className={styles.index}>0{index + 1}</span><h3>{name}</h3><p>{body}</p>
        {name === "General Food Supermarket" && <ActionLink href="#work-cases">View case study</ActionLink>}
      </Reveal>)}</div>
    </div>
  </section>;
}
