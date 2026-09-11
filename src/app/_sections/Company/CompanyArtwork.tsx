import Image from "next/image";
import { CompanyMesh } from "./CompanyMesh";
import styles from "./CompanyMesh.module.css";

export function CompanyArtwork() {
  return <>
    <div className={styles.photo}><Image
      className={styles.image}
      src="/pages/home/pictures/hero.png"
      alt=""
      fill
      sizes="(max-width: 767px) 1100px, 100vw"
      data-testid="company-image"
    /></div>
    <CompanyMesh />
  </>;
}
