import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { CompanyHero } from "./_sections/CompanyHero/CompanyHero";
import { About } from "./_sections/About/About";
import { Jamaica } from "./_sections/Jamaica/Jamaica";
import { ClosingCTA } from "./_sections/ClosingCTA/ClosingCTA";

export const metadata: Metadata = { title: "Company", description: "CrimsonTide is a Jamaica-founded software and artificial intelligence company." };
// Keep native history positions stable when the About track expands on hydration.
export default function CompanyPage() { return <><SiteHeader /><main id="main-content" tabIndex={-1} style={{ overflowAnchor: "none" }}>
  <CompanyHero />
  <About />
  <Jamaica />
  <ClosingCTA />
</main><SiteFooter /></>; }
