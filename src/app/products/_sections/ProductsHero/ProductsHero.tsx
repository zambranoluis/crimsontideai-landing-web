import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { ProductsHeroVideo } from "./ProductsHeroVideo";
import styles from "./ProductsHero.module.css";

export function ProductsHero() {
  return <section className={styles.hero} aria-labelledby="products-heading">
    <ProductsHeroVideo />
    <div className={styles.heroShade} aria-hidden="true" />
    <div className={styles.container}>
      <div className={styles.heroCopy}>
        <h1 id="products-heading">Different products for different problems<span className={styles.accent}>.</span></h1>
        <p className={styles.description}>From conversational AI for working with information, files, and tasks to computer vision that turns camera networks into detection, alerts, and operational intelligence. CrimsonTide develops products for different contexts and can adapt and integrate them around the specific needs of each organisation.</p>
        <ActionLink href="#products-openjm" variant="primary" down>Explore our products</ActionLink>
      </div>
    </div>
  </section>;
}
