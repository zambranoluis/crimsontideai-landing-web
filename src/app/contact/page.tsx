import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/sections/SiteFooter/SiteFooter";
import { RouteHero } from "@/components/sections/route/RouteSections";
import { ContactForm } from "./ContactForm";
import styles from "./page.module.css";
export const metadata: Metadata = { title: "Contact", description: "Start a conversation with CrimsonTide." };
export default function ContactPage() { return <><SiteHeader /><main id="main-content" tabIndex={-1}><RouteHero id="contact-heading" label="Contact" title="Let&apos;s talk about what you want to build" description="Whether you are exploring one of our products, an AI solution, or software built around a specific need, tell us what you have in mind." action={{ label: "Start a conversation", href: "#contact-form" }} /><section id="contact-form" className={styles.section}><div className={styles.container}><div className={styles.support}><p className={styles.label}>Contact details</p><h2>Start with the context.</h2><p>Use this demo form to explore the interaction, or contact CrimsonTide directly.</p><a href="mailto:info@crimsontide.ai">info@crimsontide.ai</a><a href="tel:+18764584187">+1 (876) 458-4187</a><p>Jamaica</p></div><div><p className={styles.label}>Start a conversation</p><h2>Tell us what you have in mind.</h2><p className={styles.formIntro}>Share a little context about what you want to explore, build, or solve.</p><ContactForm /></div></div></section></main><SiteFooter /></>; }
