import { z } from "zod";
import { env } from "@/lib/config/env";

interface TransactionalEmail {
  readonly to: string;
  readonly subject: string;
  readonly text: string;
  readonly actionUrl: string;
  readonly actionLabel: string;
}

const resendResponseSchema = z.object({ id: z.string() });

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function sendTransactionalEmail(message: TransactionalEmail): Promise<void> {
  if (env.RESEND_API_KEY === undefined || env.EMAIL_FROM === undefined) {
    if (process.env.NODE_ENV === "development") {
      console.info(`[correo local] ${message.subject} → ${message.to}\n${message.actionUrl}`);
      return;
    }
    throw new Error("Configura RESEND_API_KEY y EMAIL_FROM para enviar correos en producción.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [message.to],
      subject: message.subject,
      text: `${message.text}\n\n${message.actionLabel}: ${message.actionUrl}`,
      html: `<div style="font-family:Arial,sans-serif;background:#090a0d;color:#f7f3ec;padding:32px"><h1 style="color:#ffc15b">ValenciaSmash</h1><p>${escapeHtml(message.text)}</p><p><a href="${escapeHtml(message.actionUrl)}" style="display:inline-block;background:#ff9a2e;color:#17110a;padding:12px 20px;border-radius:24px;text-decoration:none;font-weight:bold">${escapeHtml(message.actionLabel)}</a></p><p style="color:#a6a7b0">Si no solicitaste este correo, puedes ignorarlo.</p></div>`,
    }),
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(`Resend respondió ${response.status}: ${responseText.slice(0, 300)}`);
  }

  resendResponseSchema.parse(await response.json());
}
