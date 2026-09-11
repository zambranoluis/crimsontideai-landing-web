import Image from "next/image";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./Industries.module.css";

const sectors = [
  { title: "Retail & Supermarkets", body: "Security, loss prevention, operational visibility, and analysis designed to support better decisions across retail environments.", image: "/pages/work-and-credibility/images/work-market.png", alt: "Modern supermarket environment" },
  { title: "Financial Institutions & Banks", body: "Technology applied to environments where security, operational controls, and process integrity require particularly rigorous attention.", image: "/pages/work-and-credibility/images/work-financial.png", alt: "Financial institution building at night" },
  { title: "Hospitality, Tourism & Airports", body: "Solutions for high-traffic environments where security, people flow, and operational efficiency need to work together.", image: "/pages/work-and-credibility/images/work-airport.png", alt: "Airport terminal and passenger traffic" },
  { title: "Public Sector & Institutions", body: "Technology with the potential to support security, operational visibility, decision-making, and the specific needs of public organisations and institutions.", image: "/pages/work-and-credibility/images/work-public.webp", alt: "Public institutional environment" },
  { title: "Distribution & Warehousing", body: "Solutions for distribution, logistics, and warehousing environments.", image: "/pages/work-and-credibility/images/work-distibution.png", alt: "Distribution and warehousing environment" },
] as const;

export function Industries() {
  return <section id="work-industries" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}><h2>Different environments. Different challenges.</h2><p>Technology creates value when it responds to the context in which it operates. Our experience, products, and solutions can adapt to the needs of different sectors and organisations.</p></Reveal>
      <div className={styles.sectorGrid}>{sectors.map((sector, index) => <Reveal key={sector.title} className={styles.item} delayMs={(index % 3) * 80}>
        <div className={styles.media}>
          <Image src={sector.image} alt={sector.alt} fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) 33vw, 20vw" />
        </div>
        <div className={styles.itemCopy}>
          <h3>{sector.title}</h3>
          <p>{sector.body}</p>
          {index === 0 && <ActionLink href="#work-cases" variant="text">View retail case</ActionLink>}
        </div>
      </Reveal>)}</div>
      <Reveal className={styles.outro}><p>Every sector brings different requirements. CrimsonTide can work with existing products or develop solutions around the specific context of an organisation.</p><ActionLink href="/solutions">Explore solutions for your sector</ActionLink></Reveal>
    </div>
  </section>;
}
