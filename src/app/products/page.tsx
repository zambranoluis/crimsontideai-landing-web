import { NavigationMain } from "@/components/navigation/SiteNavigation";
import { getPageMetadata } from "@/lib/seo";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { ProductsHero } from "./_sections/ProductsHero/ProductsHero";
import { OpenJMShowcase } from "./_sections/OpenJMShowcase/OpenJMShowcase";
import { SentinelShowcase } from "./_sections/SentinelShowcase/SentinelShowcase";
import styles from "./page.module.css";

export const metadata = getPageMetadata("/products");

export default function Products() {
  return <>
    <SiteHeader />
    <NavigationMain id="main-content" pathname="/products" tabIndex={-1} className={styles.main}>
      <ProductsHero />
      <OpenJMShowcase />
      <SentinelShowcase />
    </NavigationMain>
    <SiteFooter />
  </>;
}
