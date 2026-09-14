import { NavigationMain } from "@/components/navigation/SiteNavigation";
import { getPageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { WorkHero } from "./_sections/WorkHero/WorkHero";
import { CaseStudies } from "./_sections/CaseStudies/CaseStudies";
import { Industries } from "./_sections/Industries/Industries";
import { Clients } from "./_sections/Clients/Clients";
import { ClosingCTA } from "./_sections/ClosingCTA/ClosingCTA";

export const metadata = getPageMetadata("/work");
export default function WorkPage() { return <><SiteHeader /><NavigationMain id="main-content" pathname="/work" tabIndex={-1}>
  <WorkHero />
  <CaseStudies />
  <Industries />
  <Clients />
  <ClosingCTA />
</NavigationMain><SiteFooter /></>; }
