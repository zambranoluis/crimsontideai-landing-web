import { Mesh } from "@/components/visuals/Mesh/Mesh";
import type { MeshVariant } from "@/components/visuals/Mesh/presets";
import styles from "./ProductsMesh.module.css";

export function ProductsMesh({ variant }: { variant: Exclude<MeshVariant, "home"> }) {
  return <Mesh variant={variant} className={`${styles.mesh} ${styles[variant]}`} fallbackClassName={styles.fallback} testId={`products-mesh-${variant}`} />;
}
