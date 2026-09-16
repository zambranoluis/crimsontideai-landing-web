import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InternalLink, NavigationMain } from "@/components/navigation/SiteNavigation";
import { Arrow } from "@/components/ui/ActionLink/ActionLink";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { ErrorPreviewScene } from "./ErrorPreviewScene";
import styles from "./ErrorPreviewScene.module.css";

const footerLinks = [["Home", "/"], ["Products", "/products"], ["Solutions", "/solutions"], ["Work", "/work"], ["Company", "/company"]] as const;

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Error-page preview — CrimsonTide" },
  description: "Development preview for CrimsonTide's immersive error-page concept.",
  robots: { index: false, follow: false },
};

export default function ErrorPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return <div className={styles.page} data-error-preview-page>
    <section className={styles.scene} aria-labelledby="error-preview-heading">
      <header className={styles.header}>
        <a href="#error-preview-main" className={styles.skip}>Skip to content</a>
        <InternalLink href="/" aria-label="CrimsonTide home" className={styles.brand}><Wordmark /></InternalLink>
      </header>
      <NavigationMain id="error-preview-main" pathname="/error-preview" tabIndex={-1} className={styles.main}>
        <div className={styles.copy}>
          <p className={styles.status}><span aria-hidden="true" />Error</p>
          <h1 id="error-preview-heading">An error<br />occurred</h1>
          <p className={styles.subtitle}>Something went wrong<span aria-hidden="true">...</span></p>
          <p className={styles.description}>There was a problem processing your request. Please try again, or contact us if the issue persists.</p>
          <div className={styles.actions}>
            <InternalLink href="/" className={styles.homeAction}>
              <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m3 11 9-8 9 8M5.5 9v11H10v-6h4v6h4.5V9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
              Go to home
            </InternalLink>
            <InternalLink href="/contact" className={styles.contactAction}>Contact us<Arrow /></InternalLink>
          </div>
          <p className={styles.coordinates}>18.0179° N<br />76.8099° W</p>
        </div>
      </NavigationMain>
      <ErrorPreviewScene />
    </section>
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
