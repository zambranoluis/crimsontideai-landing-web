import { RouteHero } from "@/components/sections/RouteHero/RouteHero";

export function ContactHero() {
  return <RouteHero id="contact-heading" title="Let&apos;s talk about what you want to build" description="Whether you are exploring one of our products, an AI solution, or software built around a specific need, tell us what you have in mind." action={{ label: "Start a conversation", href: "#contact-form" }} />;
}
