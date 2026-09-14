"use client";

import {
  cloneElement,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  contactMessages,
  initialValues,
  limits,
  topics,
  validateContact,
  type ContactErrors,
  type ContactOutcome,
  type ContactValues,
} from "../../../contact-validation";
import styles from "./ContactForm.module.css";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function ContactForm() {
  const ready = useSyncExternalStore(subscribe, clientReady, serverReady);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [status, setStatus] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const busy = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const focusErrors = useRef(false);

  useLayoutEffect(() => {
    if (!focusErrors.current || state === "sending") return;
    // Error markup and the enabled fieldset must be committed before focusing.
    // An animation frame can run before React commits an asynchronous response.
    focusErrors.current = false;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [errors, state]);

  useEffect(
    () => () => {
      requestRef.current?.abort();
      requestRef.current = null;
      focusErrors.current = false;
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const showErrors = (next: ContactErrors) => {
    focusErrors.current = true;
    setErrors(next);
  };

  const update = (key: keyof ContactValues, value: string) => {
    if (busy.current) return;
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!ready || busy.current || state === "sent") return;
    const checked = validateContact(values);
    if (Object.keys(checked.errors).length) {
      showErrors(checked.errors);
      setStatus(contactMessages.invalid);
      return;
    }
    busy.current = true;
    setErrors({});
    setState("sending");
    setStatus("Sending your enquiry…");
    const controller = new AbortController();
    requestRef.current = controller;
    // A browser timeout cannot establish whether SMTP already accepted the enquiry.
    const timeout = setTimeout(() => controller.abort(), 125_000);
    let outcome: ContactOutcome = "uncertain";
    let mocked = false;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checked.values),
        signal: controller.signal,
      });
      const result = await response.json();
      if (
        result &&
        typeof result.outcome === "string" &&
        Object.hasOwn(contactMessages, result.outcome)
      ) {
        const candidate = result.outcome as ContactOutcome;
        // A gateway error must never be mistaken for confirmed success.
        if (
          response.ok ||
          !["success", "confirmation_failed"].includes(candidate)
        )
          outcome = candidate;
        mocked = result.mocked === true;
        if (
          outcome === "invalid" &&
          result.errors &&
          typeof result.errors === "object"
        ) {
          const next: ContactErrors = {};
          for (const key of Object.keys(
            initialValues,
          ) as (keyof ContactValues)[]) {
            if (typeof result.errors[key] === "string")
              next[key] = result.errors[key];
          }
          showErrors(next);
        }
      }
    } catch {
      // Never retry automatically: a lost response can follow an accepted email.
    } finally {
      clearTimeout(timeout);
      busy.current = false;
    }
    if (requestRef.current !== controller) return;
    requestRef.current = null;
    const sent = outcome === "success" || outcome === "confirmation_failed";
    setStatus(
      mocked && sent
        ? "Development preview: your enquiry was processed locally. No emails were sent."
        : contactMessages[outcome],
    );
    if (sent) {
      setValues({ ...initialValues });
      setState("sent");
      resetTimer.current = setTimeout(() => {
        setState("idle");
        resetTimer.current = null;
      }, 3000);
    } else {
      setState("idle");
    }
  };

  return (
    <form
      ref={formRef}
      className={styles.form}
      action="/api/contact"
      method="post"
      noValidate
      onSubmit={submit}
      aria-describedby="contact-email-help"
    >
      <fieldset
        className={styles.controls}
        disabled={!ready || state === "sending"}
        aria-busy={state === "sending"}
      >
        <legend className={styles.visuallyHidden}>Your enquiry</legend>
        <Field label="Name" error={errors.name}>
          <input
            name="name"
            required
            maxLength={limits.name}
            placeholder="Your name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field label="Work email" error={errors.email}>
          <input
            name="email"
            required
            maxLength={limits.email}
            type="email"
            placeholder="you@company.com"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            autoComplete="email"
          />
        </Field>
        <Field label="Company or organisation" error={errors.organisation}>
          <input
            name="organisation"
            maxLength={limits.organisation}
            placeholder="Your organisation, if relevant"
            value={values.organisation}
            onChange={(e) => update("organisation", e.target.value)}
            autoComplete="organisation"
          />
        </Field>
        <Field label="What would you like to discuss?" error={errors.topic}>
          <select
            name="topic"
            value={values.topic}
            onChange={(e) => update("topic", e.target.value)}
          >
            <option value="">Select a topic</option>
            {topics.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
        <Field label="Tell us a little more" error={errors.message}>
          <textarea
            name="message"
            required
            maxLength={limits.message}
            placeholder="What would you like to explore, build, or solve?"
            value={values.message}
            onChange={(e) => update("message", e.target.value)}
          />
        </Field>
        <div className={styles.visuallyHidden} aria-hidden="true">
          <label htmlFor="contact-website">Leave this field empty</label>
          <input
            id="contact-website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={values.website}
            onChange={(e) => update("website", e.target.value)}
          />
        </div>
      </fieldset>
      <p id="contact-email-help" className={styles.help}>
        Send your enquiry directly to our team. We’ll email you a confirmation
        and a copy of your message.
      </p>
      <noscript>
        <p className={styles.help}>
          To send an enquiry, email{" "}
          <a href="mailto:info@crimsontide.ai">info@crimsontide.ai</a> directly.
          This form requires JavaScript.
        </p>
      </noscript>
      <button type="submit" disabled={!ready || state !== "idle"}>
        {state === "sending"
          ? "Sending…"
          : state === "sent"
            ? "Message sent"
            : "Start Conversation"}
      </button>
      <p
        className={styles.status}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {status}
      </p>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactElement<{
    id?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
  }>;
}) {
  const id = label
    .toLowerCase()
    .replaceAll(/[^a-z]+/g, "-")
    .replaceAll(/(^-|-$)/g, "");
  const errorId = `${id}-error`;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": error ? errorId : undefined,
      })}
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
