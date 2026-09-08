import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { FooterAtmosphere } from "./FooterAtmosphere";
import styles from "./SiteFooter.module.css";

const groups = [
  { title: "Products", links: [["OpenJM", "/products#products-openjm"], ["Sentinel", "/products#products-sentinel"]] },
  { title: "Solutions", links: [["AI Solutions", "/solutions"], ["Custom Software Development", "/solutions"], ["Product Customisation", "/solutions"], ["Integrations & Deployments", "/solutions"]] },
  { title: "Work", links: [["Case Studies", "/work#work-cases"], ["Industries", "/work"], ["Clients & Partnerships", "/work"]] },
  { title: "Company", links: [["About CrimsonTide", "/company#company-about"], ["Built in Jamaica", "/company"], ["Team", "/company"], ["Insights", "/company"]] },
  { title: "Contact", links: [["Contact Us", "/contact"], ["Book a Consultation", "/contact"], ["Product Enquiry", "/contact"]] },
];

export function SiteFooter() {
  return <footer className={styles.footer}>
    <FooterAtmosphere />
    <div className={styles.inner}>
      <div className={styles.brandRow}>
        <div>
          <Link href="/" aria-label="CrimsonTide home">
            <Wordmark />
          </Link>
          <p>AI software company, built in Jamaica.</p>
        </div>
        <div className={styles.social} aria-label="Social media">
          <span>LinkedIn</span>
          <span>X</span>
          <span>YouTube</span>
          <a href="mailto:hello@crimsontide.ai">Email <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <nav aria-label="Footer" className={styles.groups}>
        {groups.map(group => <div className={styles.group} key={group.title}>
          <h2>{group.title}</h2>
          <ul>{group.links.map(([label, href]) => <li key={label}>
            <Link href={href} prefetch={false}>{label}</Link>
          </li>)}</ul>
        </div>)}
        <div className={styles.group}>
          <h2>Legal &amp; Support</h2>
          <ul>{["Privacy", "Terms", "Support"].map(label => <li key={label}>
            <span>{label}</span>
          </li>)}</ul>
        </div>
      </nav>
      <div className={styles.bottom}>© 2026 CrimsonTide AI Limited. All rights reserved.</div>
    </div>
  </footer>;
}
