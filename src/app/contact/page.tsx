import { NavigationMain } from "@/components/navigation/SiteNavigation";
import { getPageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { ContactHero } from "./_sections/ContactHero/ContactHero";
import { ContactSection } from "./_sections/ContactSection/ContactSection";
export const metadata = getPageMetadata("/contact");
export default function ContactPage() { return <><SiteHeader /><NavigationMain id="main-content" pathname="/contact" tabIndex={-1}><ContactHero /><ContactSection /></NavigationMain><SiteFooter /></>; }
