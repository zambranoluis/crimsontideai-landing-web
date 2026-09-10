import Image from "next/image";
import { ProductMotion } from "./ProductMotion";
import { SentinelCharts } from "./SentinelCharts";
import styles from "./ProductPreviews.module.css";

export function SentinelPreview() {
  return (
    <ProductMotion product="sentinel">
      <div className={`${styles.card} ${styles.sentinelCard}`}>
        <Image src="/pages/products/image/sentinel-preview.webp" alt="" width={1910} height={932}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 720px, 55vw"
          className={styles.screenshot} draggable={false} />
        <SentinelCharts />
        <div className={styles.sceneFocusFirst} data-scene-focus="0" />
        <div className={styles.sceneFocusSecond} data-scene-focus="1" />
        <div className={styles.glass} />
      </div>
    </ProductMotion>
  );
}
