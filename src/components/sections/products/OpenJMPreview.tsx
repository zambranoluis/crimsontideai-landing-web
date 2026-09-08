import Image from "next/image";
import { OpenJMParticles } from "./OpenJMParticles";
import { ProductMotion } from "./ProductMotion";
import styles from "./ProductPreviews.module.css";

export function OpenJMPreview() {
  return (
    <ProductMotion product="openjm">
      <div className={styles.card}>
        <Image src="/pages/products/image/openjm-preview.webp" alt="" width={1910} height={932}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 720px, 55vw"
          className={styles.screenshot} draggable={false} />
        <OpenJMParticles />
        <div className={styles.sidebarGlow} />
        <div className={styles.inputGlow} />
        <div className={styles.shimmer} />
        <div className={styles.glass} />
      </div>
    </ProductMotion>
  );
}
