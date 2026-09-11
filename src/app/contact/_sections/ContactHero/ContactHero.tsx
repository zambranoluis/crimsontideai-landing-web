import { ActionLink } from "@/components/ui/ActionLink/ActionLink";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { ContactMesh } from "./ContactMesh";
import { projectContactPoint } from "./contact-mesh";
import styles from "./ContactHero.module.css";

export function ContactHero() {
  return (
    <section className={styles.hero} aria-labelledby="contact-heading">
      <ContactMesh>
        <svg className={styles.fallback} viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true">
          {Array.from({ length: 28 * 12 }, (_, index) => {
            const point = projectContactPoint(index % 28, Math.floor(index / 28), 0, 1200, 700, 28, 12);
            const blue = Math.sin(point.x01 * 8.6 - point.z * 9.8) > .66;
            return <circle key={index} cx={point.x} cy={point.y} r={.6 + point.depth * 1.5} fill={blue ? "#3970ff" : "#ef3340"} opacity={.5} />;
          })}
        </svg>
      </ContactMesh>
      <div className={styles.container}>
        <Reveal className={styles.copy}>
          <h1 id="contact-heading">Let&apos;s talk about what you want to build<span className={styles.accent}>.</span></h1>
          <p>Whether you are exploring one of our products, an AI solution, or software built around a specific need, tell us what you have in mind.</p>
          <ActionLink href="#contact-form" variant="primary">Start a conversation</ActionLink>
        </Reveal>
      </div>
    </section>
  );
}
