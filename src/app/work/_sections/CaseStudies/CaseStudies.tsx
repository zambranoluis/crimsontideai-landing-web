import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { PointerGlow } from "../../_components/PointerGlow/PointerGlow";
import styles from "./CaseStudies.module.css";

export function CaseStudies() {
  return <section id="work-cases" className={styles.section}>
    <div className={styles.container}>
      <Reveal className={styles.intro}>
        <h2>From real-world context to applied technology.</h2>
        <p>Explore how CrimsonTide approaches specific needs and brings products and technology solutions into real operational environments.</p>
      </Reveal>

      <article className={styles.caseStudy} aria-labelledby="general-food-heading">
        <Reveal className={styles.bannerReveal}>
          <div className={styles.banner}>
            <Image src="/pages/work-and-credibility/images/general-food.png" alt="General Food Supermarket exterior at dusk" fill sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1023px) calc(100vw - 80px), 1280px" />
            <div className={styles.bannerFade} aria-hidden="true" />
            <div className={styles.caseIdentity}>
              <h3 id="general-food-heading">General Food Supermarket - Liguanea</h3>
              <p>CrimsonTide worked with General Food Supermarket in Liguanea on an AI-enabled camera technology implementation designed to support security, loss prevention, and greater visibility across operations.</p>
            </div>
          </div>
        </Reveal>

        <div className={styles.details} data-case-details>
          <Reveal className={styles.detailReveal}>
            <PointerGlow className={styles.detail} data-detail="context">
              <div className={styles.detailCopy}>
                <div className={styles.detailHeading}>
                  <span className={`${styles.iconBadge} ${styles.cartIcon}`} data-icon="shopping-cart.svg" aria-hidden="true" />
                  <h4>Context</h4>
                </div>
                <p>The implementation covered operational areas of the supermarket, including cashier zones, where day-to-day activity requires a combination of security, oversight, and understanding of operational patterns.</p>
              </div>
              <div className={styles.detailMedia}>
                <Image src="/pages/work-and-credibility/images/context.png" alt="Busy supermarket cashier and retail floor" fill sizes="(max-width: 1023px) calc(100vw - 40px), 33vw" />
              </div>
            </PointerGlow>
          </Reveal>

          <Reveal className={styles.detailReveal} delayMs={80}>
            <PointerGlow className={styles.detail} data-detail="technology">
              <div className={styles.detailCopy}>
                <div className={styles.detailHeading}>
                  <span className={`${styles.iconBadge} ${styles.developmentIcon}`} data-icon="dev-solutions.svg" aria-hidden="true" />
                  <h4>Applied technology</h4>
                </div>
                <p>AI-enabled cameras and analytical capabilities were introduced to observe activity, behaviour, and patterns across the supermarket environment.</p>
              </div>
              <div className={styles.detailMedia}>
                <Image src="/pages/work-and-credibility/images/appliend.png" alt="AI-enabled camera view across a supermarket floor" fill sizes="(max-width: 1023px) calc(100vw - 40px), 33vw" />
              </div>
            </PointerGlow>
          </Reveal>

          <Reveal className={styles.detailReveal} delayMs={160}>
            <PointerGlow className={styles.detail} data-detail="objectives">
              <div className={styles.detailCopy}>
                <div className={styles.detailHeading}>
                  <span className={`${styles.iconBadge} ${styles.targetIcon}`} data-icon="target.svg" aria-hidden="true" />
                  <h4>Operational objectives</h4>
                </div>
                <ul>
                  <li>Support loss prevention and security.</li>
                  <li>Increase visibility into activity and operational patterns.</li>
                  <li>Provide useful information to support decisions related to operations and customer experience.</li>
                </ul>
              </div>
              <div className={styles.detailMedia}>
                <Image src="/pages/work-and-credibility/images/operational.png" alt="Supermarket operations viewed across monitoring screens" fill sizes="(max-width: 1023px) calc(100vw - 40px), 33vw" />
              </div>
            </PointerGlow>
          </Reveal>
        </div>
      </article>
    </div>
  </section>;
}
