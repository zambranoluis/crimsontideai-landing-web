import type { Metadata } from "next";
import { InternalLink } from "@/components/navigation/SiteNavigation";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { Arrow } from "@/components/ui/ActionLink/ActionLink";
import { NotFoundScene, NotFoundMain } from "./_not-found/NotFoundScene";
import styles from "./_not-found/NotFound.module.css";

const footerLinks = [["Home", "/"], ["Products", "/products"], ["Solutions", "/solutions"], ["Work", "/work"], ["Company", "/company"]];

export const metadata: Metadata = {
  title: "404 — Page not found",
  description: "The page you’re looking for is unavailable. Return to CrimsonTide or get in touch.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <div className={styles.page} data-not-found-page>
    <header className={styles.header}>
      <a href="#main-content" className={styles.skip}>Skip to content</a>
      <InternalLink href="/" aria-label="CrimsonTide home" className={styles.brand}><Wordmark /></InternalLink>
    </header>
    <NotFoundMain className={styles.main}>
      <NotFoundScene>
        <div className={styles.copy}>
          <p className={styles.error}><span aria-hidden="true" />Error</p>
          <h1 className={styles.heading}><span className={styles.numeral}>404</span><span className={styles.title}>Page not found<span className={styles.ellipsis}>...</span></span></h1>
          <p className={styles.description}>The page you’re looking for doesn’t exist, may have moved,<br className={styles.desktopBreak} /> or is unavailable. Let’s get you back on course.</p>
          <div className={styles.actions}>
            <InternalLink href="/" className={styles.home}><svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8M5.5 9v11H10v-6h4v6h4.5V9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>Back to home</InternalLink>
            <InternalLink href="/contact" className={styles.contact}>Contact us<Arrow /></InternalLink>
          </div>
        </div>
      </NotFoundScene>
    </NotFoundMain>
    <footer className={styles.footer}>
      <InternalLink href="/" aria-label="CrimsonTide home" className={styles.footerBrand}><Wordmark /></InternalLink>
      <p className={styles.copyright}>© 2026 CrimsonTide AI Limited. All rights reserved.<br />Built in Jamaica.</p>
      <nav aria-label="Footer" className={styles.footerNav}>{footerLinks.map(([label, href]) => <InternalLink key={href} href={href}>{label}</InternalLink>)}</nav>
      <div className={styles.social} role="group" aria-label="Social media">
        <a href="https://www.instagram.com/crimsontide.ai/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".6" /></svg></a>
        <a href="https://www.youtube.com/@CrimsonTideAI" target="_blank" rel="noopener noreferrer" aria-label="YouTube"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" /></svg></a>
        <a href="mailto:info@crimsontide.ai" aria-label="Email CrimsonTide"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="1" /><path d="m3 6 9 7 9-7" /></svg></a>
      </div>
    </footer>
  </div>;
}
