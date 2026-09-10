import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { ProductsHero } from "./_sections/ProductsHero/ProductsHero";
import { OpenJMShowcase } from "./_sections/OpenJMShowcase/OpenJMShowcase";
import { SentinelShowcase } from "./_sections/SentinelShowcase/SentinelShowcase";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: { absolute: "Products — CrimsonTide" },
  description: "Explore OpenJM conversational AI and Sentinel computer vision: independent products developed by CrimsonTide for different problems and audiences.",
};

export default function Products() {
  return <>
    <SiteHeader />
    <main id="main-content" tabIndex={-1} className={styles.main}>
      <ProductsHero />
      <OpenJMShowcase />
      <SentinelShowcase />
    </main>
    <SiteFooter />
  </>;
}
