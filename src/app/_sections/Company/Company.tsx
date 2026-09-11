import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { CompanyArtwork } from "./CompanyArtwork";
import styles from "./Company.module.css";

const principles = [
  ["Built in Jamaica", "Our origin shapes how we understand technology, the problems we approach, and the opportunities we aim to create."],
  ["Proprietary technology", "We develop products, software, and technological capabilities within the company — not simply consulting services."],
  ["Regional perspective. Global potential.", "We build from Jamaica and the Caribbean without limiting the reach of what we create."],
];

export function Company() {
  return <section className={styles.section} aria-labelledby="company-heading">
    <div className={styles.artwork} data-testid="company-artwork" aria-hidden="true"><CompanyArtwork /></div>
    <div className={`${styles.container} ${styles.company}`}>
      <Reveal className={styles.companyCopy}>
        <h2 id="company-heading">Technology built in Jamaica, with relevance beyond its borders.</h2>
        <p>CrimsonTide was founded in Jamaica with the belief that products and software solutions built here can address real problems and create opportunities well beyond where they begin.</p>
        <p>We build proprietary technology from a local and regional perspective, with the capability to develop solutions for organisations across the Caribbean and beyond.</p>
      </Reveal>
      <div className={styles.principles}>{principles.map(([title, copy], index) => <Reveal key={title} className={styles.principle} delayMs={index * 80}>
        <span className={styles.principleNumber} aria-hidden="true">0{index + 1}</span>
        <div>
          <h3>{title}</h3>
          <p>{copy}</p>
        </div>
      </Reveal>)}</div>
      <Reveal className={styles.companyAction}>
        <ActionLink href="/company#company-about">About CrimsonTide</ActionLink>
      </Reveal>
    </div>
  </section>;
}
