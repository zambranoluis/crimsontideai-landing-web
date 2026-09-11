import { Mesh } from "@/components/visuals/Mesh/Mesh";
import styles from "./CompanyMesh.module.css";

export function CompanyMesh() {
  return <Mesh variant="company-mountains" className={styles.mesh} fallbackClassName={styles.fallback} testId="company-mesh" />;
}
