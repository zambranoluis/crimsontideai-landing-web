import Link from "next/link";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { FooterAtmosphere } from "./FooterAtmosphere";
import styles from "./SiteFooter.module.css";

const groups = [
  { title: "Products", items: [["OpenJM", "/products#products-openjm"], ["Sentinel", "/products#products-sentinel"]] },
  { title: "Solutions", items: [["AI Solutions", "/solutions"], ["Custom Software Development", "/solutions"], ["Product Customisation", "/solutions"], ["Integrations & Deployments", "/solutions"]] },
  { title: "Work", items: [["Case Studies", "/work#work-cases"], ["Industries", "/work#work-industries"], ["Clients & Partnerships", "/work#work-clients"]] },
  { title: "Company", items: [["About CrimsonTide", "/company#company-about"], ["Built in Jamaica", "/company#company-jamaica"], ["Team"], ["Insights"]] },
  { title: "Contact", items: [["Contact Us", "/contact"], ["Book a Consultation"], ["Product Enquiry", "/contact#contact-form"]] },
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
          <a href="mailto:info@crimsontide.ai">Email <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <nav aria-label="Footer" className={styles.groups}>
        {groups.map(group => <div className={styles.group} key={group.title}>
          <h2>{group.title}</h2>
          <ul>{group.items.map(([label, href]) => <li key={label}>
            {href ? <Link href={href} prefetch={false}>{label}</Link> : <span>{label}</span>}
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
