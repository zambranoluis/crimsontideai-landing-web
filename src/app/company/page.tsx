import { NavigationMain } from "@/components/navigation/SiteNavigation";
import { getPageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { CompanyHero } from "./_sections/CompanyHero/CompanyHero";
import { About } from "./_sections/About/About";
import { Jamaica } from "./_sections/Jamaica/Jamaica";
import { ClosingCTA } from "./_sections/ClosingCTA/ClosingCTA";

export const metadata = getPageMetadata("/company");
// Keep native history positions stable when the About track expands on hydration.
export default function CompanyPage() { return <><SiteHeader /><NavigationMain id="main-content" pathname="/company" tabIndex={-1} style={{ overflowAnchor: "none" }}>
  <CompanyHero />
  <About />
  <Jamaica />
  <ClosingCTA />
</NavigationMain><SiteFooter /></>; }
