"use client";

import { cloneElement, useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

type Values = { name: string; email: string; organisation: string; topic: string; message: string };
const initialValues: Values = { name: "", email: "", organisation: "", topic: "", message: "" };
export function ContactForm() {
  const [values, setValues] = useState(initialValues); const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [busy, setBusy] = useState(false); const [submitted, setSubmitted] = useState(false); const nameRef = useRef<HTMLInputElement>(null); const emailRef = useRef<HTMLInputElement>(null); const messageRef = useRef<HTMLTextAreaElement>(null); const confirmationRef = useRef<HTMLElement>(null);
  useEffect(() => { if (submitted) confirmationRef.current?.focus(); }, [submitted]);
  const update = (key: keyof Values, value: string) => { setValues(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const next: Partial<Record<keyof Values, string>> = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!values.email.trim()) next.email = "Enter your work email."; else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid work email.";
    if (!values.message.trim()) next.message = "Tell us a little more.";
    if (Object.keys(next).length) { setErrors(next); const first = next.name ? nameRef : next.email ? emailRef : messageRef; requestAnimationFrame(() => first.current?.focus()); return; }
    setBusy(true); window.setTimeout(() => { setBusy(false); setSubmitted(true); }, 650);
  };
  if (submitted) return <section className={styles.confirmation} ref={confirmationRef} tabIndex={-1} aria-labelledby="contact-confirmation"><p className={styles.demo}>Demo only</p><h2 id="contact-confirmation">Your message was not sent.</h2><p>This demonstration does not deliver enquiries. To contact CrimsonTide, email <a href="mailto:info@crimsontide.ai">info@crimsontide.ai</a> or call <a href="tel:+18764584187">+1 (876) 458-4187</a>.</p><button type="button" onClick={() => { setSubmitted(false); setValues(initialValues); }}>Start another demo</button></section>;
  return <form className={styles.form} noValidate onSubmit={submit} aria-busy={busy}>
    <Field label="Name" error={errors.name}><input ref={nameRef} placeholder="Your name" value={values.name} onChange={e => update("name", e.target.value)} autoComplete="name" /></Field>
    <Field label="Work email" error={errors.email}><input ref={emailRef} type="email" placeholder="you@company.com" value={values.email} onChange={e => update("email", e.target.value)} autoComplete="email" /></Field>
    <Field label="Company or organization"><input placeholder="Your organisation, if relevant" value={values.organisation} onChange={e => update("organisation", e.target.value)} autoComplete="organization" /></Field>
    <Field label="What would you like to discuss?"><select value={values.topic} onChange={e => update("topic", e.target.value)}><option value="">Select a topic</option>{["OpenJM", "Sentinel", "AI Solutions", "Custom Software", "Product Customisation", "Integrations & Deployments", "Partnerships", "Other"].map(item => <option key={item}>{item}</option>)}</select></Field>
    <Field label="Tell us a little more" error={errors.message}><textarea ref={messageRef} placeholder="What would you like to explore, build, or solve?" value={values.message} onChange={e => update("message", e.target.value)} /></Field>
    <button type="submit" disabled={busy}>{busy ? "Preparing demo confirmation…" : "Start the conversation"}</button>
  </form>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }> }) { const id = label.toLowerCase().replaceAll(/[^a-z]+/g, "-").replaceAll(/(^-|-$)/g, ""); const errorId = `${id}-error`; return <div className={styles.field}><label htmlFor={id}>{label}</label>{cloneElement(children, { id, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined })}{error && <p id={errorId} className={styles.error} role="alert">{error}</p>}</div>; }
