"use client";

import { cloneElement, useRef, useState } from "react";
import styles from "./ContactForm.module.css";

type Values = { name: string; email: string; organisation: string; topic: string; message: string };
const initialValues: Values = { name: "", email: "", organisation: "", topic: "", message: "" };
export function ContactForm() {
  const [values, setValues] = useState(initialValues); const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const nameRef = useRef<HTMLInputElement>(null); const emailRef = useRef<HTMLInputElement>(null); const messageRef = useRef<HTMLTextAreaElement>(null);
  const update = (key: keyof Values, value: string) => { setValues(current => ({ ...current, [key]: value })); setErrors(current => ({ ...current, [key]: undefined })); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const next: Partial<Record<keyof Values, string>> = {};
    if (!values.name.trim()) next.name = "Enter your name.";
    if (!values.email.trim()) next.email = "Enter your work email."; else if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Enter a valid work email.";
    if (!values.message.trim()) next.message = "Tell us a little more.";
    if (Object.keys(next).length) { setErrors(next); const first = next.name ? nameRef : next.email ? emailRef : messageRef; requestAnimationFrame(() => first.current?.focus()); return; }
    const subject = values.topic ? `${values.topic} enquiry` : "CrimsonTide enquiry";
    const body = [values.message.trim(), "", `Name: ${values.name.trim()}`, `Work email: ${values.email.trim()}`, values.organisation.trim() ? `Organisation: ${values.organisation.trim()}` : ""].filter((line, index) => line || index === 1).join("\r\n");
    window.location.href = `mailto:info@crimsontide.ai?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  return <form className={styles.form} action="mailto:info@crimsontide.ai" method="get" noValidate onSubmit={submit} aria-describedby="contact-email-help">
    <Field label="Name" error={errors.name}><input name="name" required ref={nameRef} placeholder="Your name" value={values.name} onChange={e => update("name", e.target.value)} autoComplete="name" /></Field>
    <Field label="Work email" error={errors.email}><input name="email" required ref={emailRef} type="email" placeholder="you@company.com" value={values.email} onChange={e => update("email", e.target.value)} autoComplete="email" /></Field>
    <Field label="Company or organization"><input name="organisation" placeholder="Your organisation, if relevant" value={values.organisation} onChange={e => update("organisation", e.target.value)} autoComplete="organization" /></Field>
    <Field label="What would you like to discuss?"><select name="topic" value={values.topic} onChange={e => update("topic", e.target.value)}><option value="">Select a topic</option>{["OpenJM", "Sentinel", "AI Solutions", "Custom Software", "Product Customisation", "Integrations & Deployments", "Partnerships", "Other"].map(item => <option key={item}>{item}</option>)}</select></Field>
    <Field label="Tell us a little more" error={errors.message}><textarea name="body" required ref={messageRef} placeholder="What would you like to explore, build, or solve?" value={values.message} onChange={e => update("message", e.target.value)} /></Field>
    <p id="contact-email-help" className={styles.help}>Continue in your email app to send your enquiry to <a href="mailto:info@crimsontide.ai">info@crimsontide.ai</a>.</p>
    <button type="submit">Continue in email</button>
  </form>;
}
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }> }) { const id = label.toLowerCase().replaceAll(/[^a-z]+/g, "-").replaceAll(/(^-|-$)/g, ""); const errorId = `${id}-error`; return <div className={styles.field}><label htmlFor={id}>{label}</label>{cloneElement(children, { id, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined })}{error && <p id={errorId} className={styles.error} role="alert">{error}</p>}</div>; }
