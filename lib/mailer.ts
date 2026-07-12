import nodemailer from "nodemailer";

/* Zoho Mail SMTP relay — sends using the business's own Zoho mailbox,
   authenticated with an app-specific password (Zoho Mail → Settings →
   Security → App Passwords), not the account login password. */
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.eu",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_APP_PASSWORD,
  },
});

interface SendMailArgs {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail({ to, subject, html, text, replyTo }: SendMailArgs) {
  return transporter.sendMail({
    from: `Elevate Workwear <${process.env.ZOHO_EMAIL}>`,
    to,
    replyTo,
    subject,
    html,
    text,
  });
}
