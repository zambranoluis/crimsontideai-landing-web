import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./ActionLink.module.css";

export function Arrow({ down = false }: { down?: boolean }) {
  return <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" style={down ? { rotate: "90deg" } : undefined}>
    <path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

export function ActionLink({ href, children, variant = "secondary", down = false }: { href: string; children: ReactNode; variant?: "primary" | "secondary" | "text"; down?: boolean }) {
  return <Link href={href} prefetch={false} className={styles[variant]}>{children}<Arrow down={down} />
  </Link>;
}
