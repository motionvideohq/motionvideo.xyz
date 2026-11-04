import { env } from "cloudflare:workers";

interface Email {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

// Single seam for outbound email: swap providers by editing this function.
export const sendEmail = async (email: Email): Promise<void> => {
  if (!env.RESEND_API_KEY) {
    if (import.meta.env.DEV) {
      console.info(
        `\n[email] to=${email.to} subject="${email.subject}"\n${email.text}\n`
      );
      return;
    }
    throw new Error("RESEND_API_KEY is not configured");
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      html: email.html,
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
      to: [email.to],
    }),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }
};

/**
 * Removes an email from Resend Contacts (Broadcast lists, unsubscribe state).
 * A missing Contact is fine: most accounts were never added.
 */
export const deleteContact = async (email: string): Promise<void> => {
  if (!env.RESEND_API_KEY) {
    return;
  }
  const res = await fetch(
    `https://api.resend.com/contacts/${encodeURIComponent(email)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}` },
    }
  );
  if (!res.ok && res.status !== 404) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }
};
