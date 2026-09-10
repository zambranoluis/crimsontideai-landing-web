import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";
import styles from "./ProductsSections.module.css";

export function ProductsHero() {
  return <section className={styles.hero} aria-labelledby="products-heading">
    <Image className={styles.heroImage} src="/pages/products/image/hero.png" alt="" fill sizes="100vw" preload />
    <div className={styles.heroShade} aria-hidden="true" />
    <div className={styles.container}>
      <div className={styles.heroCopy}>
        <SectionLabel>Products</SectionLabel>
        <h1 id="products-heading">Different products for different problems<span className={styles.accent}>.</span></h1>
        <p className={styles.description}>From conversational AI for working with information, files, and tasks to computer vision that turns camera networks into detection, alerts, and operational intelligence. CrimsonTide develops products for different contexts and can adapt and integrate them around the specific needs of each organisation.</p>
        <ActionLink href="#products-openjm" variant="primary" down>Explore our products</ActionLink>
      </div>
    </div>
  </section>;
}
