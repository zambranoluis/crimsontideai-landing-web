import { Mesh } from "@/components/visuals/Mesh/Mesh";
import styles from "./HeroMesh.module.css";

export function HeroMesh() {
  return <Mesh variant="home" className={styles.mesh} fallbackClassName={styles.fallback} testId="hero-mesh" />;
}
