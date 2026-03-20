import nodemailer from "nodemailer";

type VerificationEmailOptions = {
  to: string;
  code: string;
};

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";

  if (!host || !user || !pass || !from) {
    throw new Error(
      "SMTP is not fully configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
    );
  }

  return { host, port, user, pass, from, secure };
}

export async function sendVerificationCodeEmail(
  options: VerificationEmailOptions,
) {
  const smtp = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const subject = "StudyMate AI verification code";
  const text = `Your StudyMate AI verification code is ${options.code}. This code expires in 10 minutes.`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;">
      <h2 style="margin-bottom:8px;">Verify your email</h2>
      <p>Use this code to complete your StudyMate AI registration:</p>
      <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:16px 0;">${options.code}</p>
      <p>This code expires in 10 minutes.</p>
      <p style="color:#6b7280;font-size:12px;">If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: smtp.from,
    to: options.to,
    subject,
    text,
    html,
  });
}
