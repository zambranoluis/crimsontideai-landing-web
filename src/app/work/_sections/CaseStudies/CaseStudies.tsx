import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./CaseStudies.module.css";

export function CaseStudies() {
  return <section id="work-cases" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2>From real-world context to applied technology.</h2>
        <p>Explore how CrimsonTide approaches specific needs and brings products and technology solutions into real operational environments.</p>
      </Reveal>

      <article className={styles.caseStudy} aria-labelledby="general-food-heading">
        <Reveal className={styles.caseIdentity}>
          <h3 id="general-food-heading">General Food Supermarket - Liguanea</h3>
          <p>CrimsonTide worked with General Food Supermarket in Liguanea on an AI-enabled camera technology implementation designed to support security, loss prevention, and greater visibility across operations.</p>
        </Reveal>

        <Reveal className={styles.banner}>
          <Image src="/pages/work-and-credibility/images/general-food.png" alt="General Food Supermarket exterior at dusk" fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 80px), 1280px" />
        </Reveal>

        <div className={styles.details}>
          <Reveal className={`${styles.detail} ${styles.context}`}>
            <div className={styles.detailMedia}>
              <Image src="/pages/work-and-credibility/images/context.png" alt="Busy supermarket cashier and retail floor" fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) calc(100vw - 80px), 58vw" />
            </div>
            <div className={styles.detailCopy}>
              <h4>Context</h4>
              <p>The implementation covered operational areas of the supermarket, including cashier zones, where day-to-day activity requires a combination of security, oversight, and understanding of operational patterns.</p>
            </div>
          </Reveal>

          <Reveal className={styles.detail} delayMs={80}>
            <div className={styles.detailMedia}>
              <Image src="/pages/work-and-credibility/images/appliend.png" alt="AI-enabled camera view across a supermarket floor" fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) 50vw, 40vw" />
            </div>
            <div className={styles.detailCopy}>
              <h4>Applied technology</h4>
              <p>AI-enabled cameras and analytical capabilities were introduced to observe activity, behaviour, and patterns across the supermarket environment.</p>
            </div>
          </Reveal>

          <Reveal className={styles.detail} delayMs={160}>
            <div className={styles.detailMedia}>
              <Image src="/pages/work-and-credibility/images/operational.png" alt="Supermarket operations viewed across monitoring screens" fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1199px) 50vw, 40vw" />
            </div>
            <div className={styles.detailCopy}>
              <h4>Operational objectives</h4>
              <ul>
                <li>Support loss prevention and security.</li>
                <li>Increase visibility into activity and operational patterns.</li>
                <li>Provide useful information to support decisions related to operations and customer experience.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </article>
    </div>
  </section>;
}
