import Image from "next/image";
import { ProductMotion } from "../../_components/ProductMotion";
import { SentinelCharts } from "./SentinelCharts";
import styles from "./SentinelPreview.module.css";

export function SentinelPreview() {
  return (
    <ProductMotion product="sentinel">
      <div className={styles.card}>
        <Image src="/pages/products/images/sentinel-preview.webp" alt="" width={1910} height={932}
          sizes="(max-width: 767px) 90vw, (max-width: 1023px) 720px, 55vw"
          className={styles.screenshot} draggable={false} />
        <SentinelCharts />
        <div className={styles.glass} />
      </div>
    </ProductMotion>
  );
}
