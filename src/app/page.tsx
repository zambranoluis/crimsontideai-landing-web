import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/sections/SiteFooter/SiteFooter";
import { HomeHero } from "@/components/sections/home/HomeHero";
import { WhatWeBuild } from "@/components/sections/home/WhatWeBuild";
import { Experience } from "@/components/sections/home/Experience";
import { Company } from "@/components/sections/home/Company";
import { ClosingCTA } from "@/components/sections/home/ClosingCTA";
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
