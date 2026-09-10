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
  { title: "Legal & Support", items: [["Privacy"], ["Terms"], ["Support"]] },
];

export function SiteFooter() {
  return <footer className={styles.footer} data-terrain-host>
    <FooterAtmosphere />
    <div className={styles.inner}>
      <div className={styles.main}>
        <div className={styles.brand}>
          <Link href="/" aria-label="CrimsonTide home">
            <Wordmark />
          </Link>
          <p>AI software company, built in Jamaica.</p>
          <div className={styles.social} role="group" aria-label="Social media">
            <span className={styles.socialItem} role="img" aria-label="LinkedIn" title="LinkedIn">
              <span className={styles.linkedin} aria-hidden="true" />
            </span>
            <span className={styles.socialItem} role="img" aria-label="X" title="X">
              <span className={styles.socialX} aria-hidden="true" />
            </span>
            <span className={styles.socialItem} role="img" aria-label="YouTube" title="YouTube">
              <span className={styles.youtube} aria-hidden="true" />
            </span>
            <a className={styles.socialItem} href="mailto:info@crimsontide.ai" aria-label="Email CrimsonTide" title="Email CrimsonTide">
              <span className={styles.mail} aria-hidden="true" />
            </a>
          </div>
        </div>
        <nav aria-label="Footer" className={styles.groups}>
          {groups.map(group => <div className={styles.group} key={group.title}>
            <h2>{group.title}</h2>
            <ul>{group.items.map(([label, href]) => <li key={label}>
              {href
                ? <Link href={href} prefetch={false}><span className={styles.optionLabel}>{label}</span></Link>
                : <span><span className={styles.optionLabel}>{label}</span></span>}
            </li>)}</ul>
          </div>)}
        </nav>
      </div>
    </div>
    <div className={styles.bottom}>
      <div className={styles.bottomInner}>
        <span>© 2026 CrimsonTide AI Limited. All rights reserved.</span>
        <span className={styles.legalName}>CrimsonTide AI Limited</span>
      </div>
    </div>
  </footer>;
}
