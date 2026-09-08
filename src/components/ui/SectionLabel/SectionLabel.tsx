import styles from "./SectionLabel.module.css";
export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className={styles.label}>{children}</p>;
}
