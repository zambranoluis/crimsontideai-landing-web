import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./OpenJMShowcase.module.css";
import { OpenJMPreview } from "./OpenJMPreview";
import { ProductsMesh } from "../../_components/ProductsMesh";
import { ProductScene } from "../../_components/ProductScene";
import { ProductIcon } from "../../_components/ProductIcon";

const points = [
  ["Explore new possibilities", "Go deeper into ideas, questions, and information to uncover new perspectives and paths forward."],
  ["Turn information into progress", "Work with documents, images, and code to understand, analyse, and make better use of the context you already have."],
  ["Build and keep moving", "Develop content, tasks, and projects through conversations that can grow alongside you and what you are creating."],
] as const;

export function OpenJMShowcase() {
  return <section id="products-openjm" className={styles.showcase} aria-labelledby="openjm-heading">
    <ProductsMesh variant="openjm" />
    <div className={styles.container}>
      <div className={styles.copy}>
        <Reveal>
          <p className={styles.productBrand}>
            <Image className={styles.productWordmark} src="/logos/openjm-words.svg" alt="OpenJM" width={697} height={236} />
          </p>
          <h2 id="openjm-heading">Expand your horizons with artificial intelligence<span className={styles.accent}>.</span></h2>
        </Reveal>
        <Reveal delayMs={80}><p className={styles.description}>OpenJM turns artificial intelligence into a space for developing ideas, understanding information more clearly, and moving from a question or file towards useful outcomes. Work through natural conversation, bring in context, and keep building as your goals evolve.</p></Reveal>
      </div>
      <ProductScene product="openjm" preview={<OpenJMPreview />}>
          {points.map(([title, description], index) => <li key={title} data-feature-step={index}>
            <Reveal className={styles.feature}>
              <span className={styles.pointIcon}><ProductIcon name={(["idea", "document", "progress"] as const)[index]} /></span>
              <div><h3>{title}</h3><p>{description}</p></div>
            </Reveal>
          </li>)}
      </ProductScene>
      <div className={styles.productEnd}>
        <p><span className={styles.endIcon}><ProductIcon name="globe" /></span>Developed by CrimsonTide in Jamaica. Available worldwide.</p>
        <ActionLink href="https://openjm.ai" variant="primary">Explore OpenJM</ActionLink>
      </div>
    </div>
  </section>;
}
