import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { HomeHero } from "./_sections/HomeHero/HomeHero";
import { WhatWeBuild } from "./_sections/WhatWeBuild/WhatWeBuild";
import { Experience } from "./_sections/Experience/Experience";
import { Company } from "./_sections/Company/Company";
import { ClosingCTA } from "./_sections/ClosingCTA/ClosingCTA";
import styles from "./page.module.css";

export const metadata: Metadata = { title: { absolute: "CrimsonTide — AI software company, built in Jamaica." } };

export default function Home() {
  return <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1} className={styles.main}>
      <HomeHero />
      <WhatWeBuild />
      <Experience />
      <Company />
      <ClosingCTA />
    </main>
    <SiteFooter />
  </>;
}
