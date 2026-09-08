import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/sections/SiteFooter/SiteFooter";
import { ProductsHero } from "@/components/sections/products/ProductsHero";
import { OpenJMShowcase } from "@/components/sections/products/OpenJMShowcase";
import { SentinelShowcase } from "@/components/sections/products/SentinelShowcase";
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
