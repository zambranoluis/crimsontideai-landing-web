import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter/SiteFooter";
import { ContactHero } from "./_sections/ContactHero/ContactHero";
import { ContactSection } from "./_sections/ContactSection/ContactSection";
export const metadata: Metadata = { title: "Contact", description: "Start a conversation with CrimsonTide." };
export default function ContactPage() { return <><SiteHeader /><main id="main-content" data-navigation-route="/contact" tabIndex={-1}><ContactHero /><ContactSection /></main><SiteFooter /></>; }
