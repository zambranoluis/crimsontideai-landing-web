import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { WorkHero } from "./_sections/WorkHero/WorkHero";
import { CaseStudies } from "./_sections/CaseStudies/CaseStudies";
import { Industries } from "./_sections/Industries/Industries";
import { Clients } from "./_sections/Clients/Clients";
import { ClosingCTA } from "./_sections/ClosingCTA/ClosingCTA";

export const metadata: Metadata = { title: "Work & Credibility", description: "Documented CrimsonTide work, sector relevance, and client relationships." };
export default function WorkPage() { return <><SiteHeader /><main id="main-content" tabIndex={-1}>
  <WorkHero />
  <CaseStudies />
  <Industries />
  <Clients />
  <ClosingCTA />
</main><SiteFooter /></>; }
