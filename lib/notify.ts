import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL ?? "fabio@neo457.ch";

export async function sendTelegram(text: string): Promise<void> {
  if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      }),
    });
  } catch {
    // Benachrichtigungsfehler sollen die Hauptaktion nicht blockieren
  }
}

type EmailOptions = {
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendNotifyEmail({ subject, html, replyTo }: EmailOptions): Promise<void> {
  try {
    await resend.emails.send({
      from: "NeoFlow <info@neo457.ch>",
      to: NOTIFY_EMAIL,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
  } catch {
    // Benachrichtigungsfehler sollen die Hauptaktion nicht blockieren
  }
}
