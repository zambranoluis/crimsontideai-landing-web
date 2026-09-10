import Image from "next/image";
import { HeroMesh } from "./HeroMesh";
import styles from "./HeroMesh.module.css";

export function HeroArtwork() {
  return <>
    <Image
      className={styles.image}
      src="/pages/home/pictures/hero.png"
      alt=""
      fill
      sizes="100vw"
      preload
      data-testid="hero-image"
    />
    <HeroMesh />
  </>;
}
