import { TerrainMesh } from "@/components/visuals/TerrainMesh/TerrainMesh";
import styles from "./FooterAtmosphere.module.css";

export function FooterAtmosphere() {
  return <div data-testid="footer-atmosphere">
    <TerrainMesh className={styles.atmosphere} testId="footer-terrain-mesh" interactionHostSelector="[data-terrain-host]" />
  </div>;
}
