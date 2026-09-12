import type { Metadata } from "next";
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

export const metadata: Metadata = { title: "AI Solutions", description: "AI solutions designed around an organisation's objectives, context, and real operating environment." };
export default function SolutionsPage() { return <><SiteHeader /><main id="main-content" tabIndex={-1} className={styles.page}>
  <ClosingCTA />
  <Opportunities />
  <Process />
  <Context />
  <Delivery />
  <Experience />
  <SolutionsHero />
</main><SiteFooter /></>; }
