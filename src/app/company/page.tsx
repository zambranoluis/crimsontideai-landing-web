import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/sections/SiteFooter/SiteFooter";
import { Closing, RouteHero } from "@/components/sections/route/RouteSections";
import styles from "@/components/sections/route/RouteSections.module.css";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";

export const metadata: Metadata = { title: "Company", description: "CrimsonTide is a Jamaica-founded software and artificial intelligence company." };
const principles = [
  { title: "We build proprietary technology", body: "We develop products and technological capabilities within CrimsonTide, building knowledge and experience that can evolve with every new challenge." },
  { title: "We build around context", body: "When a need requires something different, we can design, adapt, or develop technology around an organisation's objectives, processes, and environment." },
  { title: "We carry ideas into use", body: "Our work spans from defining what is worth building to developing, integrating, and implementing solutions that can become part of real operations." },
] as const;
export default function CompanyPage() { return <><SiteHeader /><main id="main-content" tabIndex={-1}>
  <RouteHero id="company-heading" label="Company" title="We turn possibilities into technology that can move forward" description="CrimsonTide is a software and artificial intelligence company developing proprietary products and solutions around real needs, combining technological capability, vision, and a perspective built from Jamaica." action={{ label: "Discover CrimsonTide", href: "#company-about" }} />
  <section id="company-about" className={styles.section}><div className={styles.container}><Reveal className={styles.intro}><SectionLabel>About CrimsonTide</SectionLabel><h2>We build technology to take ideas beyond intention.</h2><p>CrimsonTide combines proprietary product development with software and artificial intelligence solutions for organisations looking to turn objectives, processes, and opportunities into technology that can be used in the real world.</p><p>Our capability does not begin or end with a single platform. We design products, develop software, apply artificial intelligence where it adds value, and work through to integrating technology within the context where it needs to perform.</p></Reveal><div className={styles.threeItems}>{principles.map((principle, index) => <Reveal key={principle.title} className={styles.item}><span className={styles.index}>0{index + 1}</span><h3>{principle.title}</h3><p>{principle.body}</p></Reveal>)}</div></div></section>
  <section id="company-jamaica" className={styles.closing}><div className={styles.container}><Reveal className={styles.closingCopy}><SectionLabel>Built in Jamaica</SectionLabel><h2>Technology developed from Jamaica and the Caribbean.</h2><p>CrimsonTide is a software and artificial intelligence company founded in Jamaica. From the Caribbean, we develop proprietary products, software, and technology solutions for organisations with different needs, operations, and environments.</p></Reveal></div></section>
  <Closing title="Let&apos;s talk about what comes next." description="If you are exploring an opportunity, a technology need, or a new initiative, our team can help determine where CrimsonTide can add value." />
</main><SiteFooter /></>; }
