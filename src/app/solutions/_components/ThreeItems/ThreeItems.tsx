import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./ThreeItems.module.css";

type Item = { title: string; body: string; kicker?: string };

export function ThreeItems({ title, description, items, connected = false, alternate = false }: {
  title: string;
  description: string;
  items: readonly Item[];
  connected?: boolean;
  alternate?: boolean;
}) {
  return <section className={`${styles.section} ${alternate ? styles.alternate : ""}`}>
    <div className={styles.container}>
      <Reveal className={styles.intro}><h2>{title}</h2><p>{description}</p></Reveal>
      <div className={`${styles.threeItems} ${connected ? styles.connected : ""}`}>
        {items.map((item, index) => <Reveal key={item.title} className={styles.item} delayMs={index * 80}>
          <span className={styles.index}>0{index + 1}</span>
          {item.kicker && <p className={styles.kicker}>{item.kicker}</p>}
          <h3>{item.title}</h3><p>{item.body}</p>
        </Reveal>)}
      </div>
    </div>
  </section>;
}
