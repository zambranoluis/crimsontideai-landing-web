import type { Metadata } from "next";
import { SiteHeader } from "@/components/sections/SiteHeader/SiteHeader";
import { SiteFooter } from "@/components/sections/SiteFooter/SiteFooter";
import { Closing, RouteHero, ThreeItems } from "@/components/sections/route/RouteSections";
import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { SectionLabel } from "@/components/ui/SectionLabel/SectionLabel";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "@/components/sections/route/RouteSections.module.css";

export const metadata: Metadata = { title: "AI Solutions", description: "AI solutions designed around an organisation's objectives, context, and real operating environment." };
const opportunities = [
  { title: "Solve a specific challenge", body: "Explore how artificial intelligence can become part of a solution designed around a specific business or operational need." },
  { title: "Improve how work gets done", body: "Identify opportunities to reduce friction, support decisions, and improve existing processes through artificial intelligence capabilities." },
  { title: "Create a new capability", body: "Develop new tools, experiences, or ways of working that expand what your organisation can do." },
] as const;
const context = [
  { title: "Your Objective", kicker: "Start with what you want to achieve.", body: "We define the purpose of the solution around the outcome, improvement, or new capability you want to develop." },
  { title: "Your Environment", kicker: "Understand where it needs to work.", body: "We consider the processes, systems, and conditions that shape the environment in which the solution will operate." },
  { title: "Your Solution", kicker: "Build around those needs.", body: "From that context, we define a solution that brings together the right technology and capabilities for the project." },
] as const;
const delivery = [
  { title: "Build", kicker: "Turn the direction into a working solution.", body: "We develop the software and capabilities required to transform an approved concept into technology that can be used." },
  { title: "Connect", kicker: "Integrate it where it needs to work.", body: "When required, we connect the solution with the systems, processes, or environments that form part of its operation." },
  { title: "Put into Use", kicker: "Move from development to real implementation.", body: "We bring the solution into use within the organisation, considering what it needs to become part of the working environment." },
] as const;

export default function SolutionsPage() { return <><SiteHeader /><main id="main-content" tabIndex={-1}>
  <RouteHero id="solutions-heading" label="AI Solutions" title="Artificial intelligence designed around your objectives" description="When a need calls for something more specific, CrimsonTide works with organisations to design, build, and implement AI solutions around their context, workflows, and objectives." action={{ label: "Discuss an AI solution", href: "/contact" }} />
  <ThreeItems label="Problems & Opportunities" title="We start with what you want to achieve, not the technology." description="Every organisation starts from a different context. An AI solution can begin with a challenge, a process that could work better, or a new capability you want to develop." items={opportunities} />
  <ThreeItems label="Built Around Your Context" title="The solution should adapt to your organisation, not the other way around." description="Every project starts with different objectives, ways of working, and conditions. We design around that reality." items={context} />
  <ThreeItems label="From Concept to Real Use" title="A solution creates value when it can be put into practice." description="CrimsonTide can take a defined direction beyond the concept stage and prepare it to work where it will be used." items={delivery} connected />
  <section className={styles.section}><div className={styles.container}><Reveal className={styles.intro}><SectionLabel>Experience in Practice</SectionLabel><h2>Solutions built to work in real-world environments.</h2><p>Our experience includes projects where artificial intelligence and software have moved beyond the concept stage and into real operations.</p></Reveal><Reveal className={styles.item}><p className={styles.kicker}>Featured Case - Retail</p><h3>General Food Supermarket - Liguanea</h3><p>CrimsonTide implemented AI-enabled camera technology across operational areas of the supermarket to support security, loss prevention, and operational analysis.</p><p>The implementation included cashier zones and analytical capabilities designed to provide greater visibility into activity, behaviour, and operational patterns.</p><ActionLink href="/work#work-cases">View case study</ActionLink></Reveal><Reveal className={styles.intro}><p>Organisations that form part of CrimsonTide&apos;s experience: Guardsman Group, General Food Supermarket, and Beryllium.</p></Reveal></div></section>
  <Closing title="Tell us what you want to achieve. Let&apos;s build the path to make it possible." description="Whether you want to solve a challenge, improve how something works, or develop a new capability, we can start by understanding the objective." action={{ label: "Discuss an AI solution", href: "/contact" }} />
</main><SiteFooter /></>; }
