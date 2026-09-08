import Image from "next/image";
import styles from "./Wordmark.module.css";

export function Wordmark() {
  return <Image
    className={styles.wordmark}
    src="/logo/crimson_black.png"
    alt=""
    width={1343}
    height={179}
  />;
}
