import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./RouteSections.module.css";

export function RouteHero({ label, title, description, action, id }: { label: string; title: string; description: string; action: { label: string; href: string }; id: string }) {
  return <section className={styles.hero} aria-labelledby={id}>
    <div className={styles.container}><Reveal className={styles.heroCopy}>
      <SectionLabel>{label}</SectionLabel><h1 id={id}>{title}<span className={styles.accent}>.</span></h1>
      <p>{description}</p><ActionLink href={action.href} variant="primary">{action.label}</ActionLink>
    </Reveal></div>
  </section>;
}

export function Closing({ title, description, eyebrow = "Start a conversation", action = { label: "Contact CrimsonTide", href: "/contact" } }: { title: string; description: string; eyebrow?: string; action?: { label: string; href: string } }) {
  return <section className={styles.closing}><div className={styles.container}><Reveal className={styles.closingCopy}>
    <SectionLabel>{eyebrow}</SectionLabel><h2>{title}</h2><p>{description}</p><ActionLink href={action.href} variant="primary">{action.label}</ActionLink>
  </Reveal></div></section>;
}

export function ThreeItems({ label, title, description, items, connected = false }: { label: string; title: string; description: string; items: readonly { title: string; body: string; kicker?: string }[]; connected?: boolean }) {
  return <section className={styles.section}><div className={styles.container}>
    <Reveal className={styles.intro}><SectionLabel>{label}</SectionLabel><h2>{title}</h2><p>{description}</p></Reveal>
    <div className={`${styles.threeItems} ${connected ? styles.connected : ""}`}>{items.map((item, index) => <Reveal key={item.title} className={styles.item}>
      <span className={styles.index}>0{index + 1}</span>{item.kicker && <p className={styles.kicker}>{item.kicker}</p>}<h3>{item.title}</h3><p>{item.body}</p>
    </Reveal>)}</div>
  </div></section>;
}
