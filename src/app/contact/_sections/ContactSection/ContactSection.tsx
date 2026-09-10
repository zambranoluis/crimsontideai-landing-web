import { ContactForm } from "./ContactForm/ContactForm";
import styles from "./ContactSection.module.css";

export function ContactSection() {
  return <section id="contact-form" className={styles.section}>
    <div className={styles.container}>
      <div className={styles.support}>
        <p className={styles.label}>Contact details</p>
        <h2>Start with the context.</h2>
        <p>Use the form to explore this demonstration, or contact CrimsonTide directly.</p>
        <a href="mailto:info@crimsontide.ai">info@crimsontide.ai</a>
        <a href="tel:+18764584187">+1 (876) 458-4187</a>
        <p><strong>Head Office</strong><br />53 Lady Musgrave Road, Kingston 8, Pinnacle Pointe, Unit #3<br />Monday-Friday, 9:00 AM-5:00 PM EST</p>
        <p><strong>Satellite Office</strong><br />279 Poinciana Drive, Greenwood, St. James<br />Monday-Friday, 9:00 AM-3:00 PM EST</p>
        <p>Jamaica</p>
        <p className={styles.label}>What happens next</p>
        <p>This demonstration sends nothing. To contact CrimsonTide, use the email address or phone number above.</p>
      </div>
      <div>
        <p className={styles.label}>Start a conversation</p>
        <h2>Tell us what you have in mind.</h2>
        <p className={styles.formIntro}>Share a little context about what you want to explore, build, or solve.</p>
        <ContactForm />
      </div>
    </div>
  </section>;
}
