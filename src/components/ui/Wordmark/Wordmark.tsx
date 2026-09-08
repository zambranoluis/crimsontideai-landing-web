import styles from "./Wordmark.module.css";

export function Wordmark() {
  return <span className={styles.wordmark}>
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M26 7A13 13 0 1 0 26 25L22 21A7.5 7.5 0 1 1 22 11Z" fill="currentColor" />
      <path d="m16 14 14-4-7 8-7 1Z" fill="currentColor" />
    </svg>
    <span>CrimsonTide</span>
  </span>;
}
