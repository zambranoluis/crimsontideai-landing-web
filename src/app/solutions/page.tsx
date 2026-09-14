import { NavigationMain } from "@/components/navigation/SiteNavigation";
import { getPageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { SolutionsHero } from "./_sections/SolutionsHero/SolutionsHero";
import { Opportunities } from "./_sections/Opportunities/Opportunities";
import { Process } from "./_sections/Process/Process";
import { Context } from "./_sections/Context/Context";
import { Delivery } from "./_sections/Delivery/Delivery";
import { Experience } from "./_sections/Experience/Experience";
import { ClosingCTA } from "./_sections/ClosingCTA/ClosingCTA";
import styles from "./page.module.css";

export const metadata = getPageMetadata("/solutions");
export default function SolutionsPage() { return <><SiteHeader /><NavigationMain id="main-content" pathname="/solutions" tabIndex={-1} className={styles.page}>
  <ClosingCTA />
  <Opportunities />
  <Process />
  <Context />
  <Delivery />
  <Experience />
  <SolutionsHero />
</NavigationMain><SiteFooter /></>; }
