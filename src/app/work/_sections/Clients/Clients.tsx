import { Reveal } from "@/components/ui/Reveal/Reveal";
import { PartnerGrid, type Partner } from "./PartnerGrid";
import styles from "./Clients.module.css";

const clients: ReadonlyArray<Partner> = [
  { name: "Bahia Principe", src: "/logos/partner-brands/bahia.png", width: 300, height: 147, visualWidth: "68%" },
  { name: "Barita Investments", src: "/logos/partner-brands/barita.png", width: 300, height: 102, visualWidth: "72%" },
  { name: "Beryllium", src: "/logos/partner-brands/beryllium.webp", width: 300, height: 300, visualWidth: "47%" },
  { name: "Café Blue", src: "/logos/partner-brands/cafe-blue.png", width: 200, height: 200, visualWidth: "44%" },
  { name: "CB Chicken", src: "/logos/partner-brands/cb-chicken.png", width: 300, height: 300, visualWidth: "46%" },
  { name: "Dufry", src: "/logos/partner-brands/dufry.png", width: 300, height: 100, visualWidth: "66%" },
  { name: "General Food Supermarket", src: "/logos/partner-brands/general-food.png", width: 300, height: 118, visualWidth: "72%" },
  { name: "Guardsman Group", src: "/logos/partner-brands/guardsman.webp", width: 300, height: 85, visualWidth: "72%" },
  { name: "Kremi", src: "/logos/partner-brands/kremi.png", width: 300, height: 272, visualWidth: "48%" },
  { name: "MegaMart", src: "/logos/partner-brands/megamart.png", width: 300, height: 80, visualWidth: "78%" },
  { name: "Metaverse", src: "/logos/partner-brands/metaverse.png", width: 288, height: 210, visualWidth: "55%" },
  { name: "Playa Hotels and Resorts", src: "/logos/partner-brands/playa.png", width: 300, height: 160, visualWidth: "62%" },
  { name: "RG", src: "/logos/partner-brands/rg.png", width: 200, height: 100, visualWidth: "54%" },
  { name: "The Gleaner", src: "/logos/partner-brands/the-gleaner.png", width: 300, height: 52, visualWidth: "80%" },
  { name: "WM Group", src: "/logos/partner-brands/wm-group.png", width: 300, height: 200, visualWidth: "56%" },
];

export function Clients() {
  return <section id="work-clients" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}><h2>Credibility is also built through real relationships.</h2><p>Organisations and relationships that form part of CrimsonTide&apos;s experience and help demonstrate how our technological capabilities connect with real-world contexts.</p></Reveal>
      <Reveal><PartnerGrid partners={clients} /></Reveal>
    </div>
  </section>;
}
