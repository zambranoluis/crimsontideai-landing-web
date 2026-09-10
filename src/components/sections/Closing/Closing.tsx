import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Closing.module.css";

type ClosingProps = {
  title: string;
  description: string;
  action?: { label: string; href: string };
};

export function Closing({ title, description, action = { label: "Contact CrimsonTide", href: "/contact" } }: ClosingProps) {
  return <section className={styles.closing}>
    <div className={styles.container}>
      <Reveal className={styles.closingCopy}>
        <h2>{title}</h2>
        <p>{description}</p>
        <ActionLink href={action.href} variant="primary">{action.label}</ActionLink>
      </Reveal>
    </div>
  </section>;
}
