import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./RouteHero.module.css";

type RouteHeroProps = {
  title: string;
  description: string;
  action: { label: string; href: string };
  id: string;
};

export function RouteHero({ title, description, action, id }: RouteHeroProps) {
  return <section className={styles.hero} aria-labelledby={id}>
    <div className={styles.container}>
      <Reveal className={styles.heroCopy}>
        <h1 id={id}>{title}<span className={styles.accent}>.</span></h1>
        <p>{description}</p>
        <ActionLink href={action.href} variant="primary">{action.label}</ActionLink>
      </Reveal>
    </div>
  </section>;
}
