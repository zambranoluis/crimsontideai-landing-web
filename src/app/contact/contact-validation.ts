export const topics = ["OpenJM", "Sentinel", "AI Solutions", "Custom Software", "Product Customisation", "Integrations & Deployments", "Partnerships", "Other"];
export const limits = { name: 120, email: 254, organisation: 200, message: 5000 };
export type ContactValues = { name: string; email: string; organisation: string; topic: string; message: string; website: string };
export type ContactErrors = Partial<Record<keyof ContactValues, string>>;
export const initialValues: ContactValues = { name: "", email: "", organisation: "", topic: "", message: "", website: "" };
// A single mailbox, never a display name or recipient list. Header controls are forbidden.
export const isEmail = (value: string) => value.length <= limits.email && /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+$/.test(value);

export function validateContact(input: unknown): { values: ContactValues; errors: ContactErrors } {
  const values = { ...initialValues };
  const errors: ContactErrors = {};
  const data = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  for (const key of Object.keys(values) as (keyof ContactValues)[]) {
    if (data[key] === undefined && ["organisation", "topic", "website"].includes(key)) continue;
    if (typeof data[key] !== "string") { errors[key] = "Enter a valid value."; continue; }
    const raw = data[key] as string;
    values[key] = key === "message" ? raw.replace(/\r\n?/g, "\n") : raw.trim();
    if (key in limits && raw.length > limits[key as keyof typeof limits]) errors[key] = `Use ${limits[key as keyof typeof limits].toLocaleString("en-US")} characters or fewer.`;
    if (key !== "message" && /[\r\n\u0000-\u001f\u007f]/.test(raw)) errors[key] = "Use a single line without control characters.";
  }
  if (!values.name) errors.name = "Enter your name.";
  if (!values.email) errors.email = "Enter your work email.";
  else if (!isEmail(values.email)) errors.email = "Enter a valid work email.";
  if (!values.message.trim()) errors.message = "Tell us a little more.";
  if (values.topic && !topics.includes(values.topic)) errors.topic = "Select a listed topic.";
  if (values.website) errors.website = "Unable to submit this enquiry.";
  return { values, errors };
}

export const contactMessages = {
  success: "Your enquiry was sent. We’ve emailed you a confirmation and a copy of your message.",
  confirmation_failed: "Your enquiry was sent, but we couldn’t send your confirmation email. You don’t need to submit it again.",
  submission_failed: "Your enquiry wasn’t sent. Please try again or email info@crimsontide.ai directly.",
  uncertain: "We couldn’t confirm delivery of your enquiry. It may have been sent. Please contact info@crimsontide.ai before submitting again to avoid a duplicate.",
  invalid: "Check the highlighted fields and submit again.",
  rejected: "Your enquiry wasn’t sent. Please email info@crimsontide.ai directly.",
} as const;
export type ContactOutcome = keyof typeof contactMessages;
