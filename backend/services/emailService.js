import nodemailer from "nodemailer";

const REQUIRED_MAIL_ENV_KEYS = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"];

export const isMailConfigured = () =>
  REQUIRED_MAIL_ENV_KEYS.every((key) => Boolean(process.env[key]));

const getTransporter = () => {
  if (!isMailConfigured()) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT);

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async ({
  to,
  name,
  role,
  resetUrl,
}) => {
  const transporter = getTransporter();

  if (!transporter) {
    const error = new Error("SMTP is not configured");
    error.code = "MAIL_NOT_CONFIGURED";
    throw error;
  }

  const expiryMinutes = Number(
    process.env.PASSWORD_RESET_EXPIRES_MINUTES || 15
  );
  const appName = process.env.APP_NAME || "Car Rental";
  const roleLabel = role === "owner" ? "owner" : "customer";
  const safeName = name || "there";

  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: `${appName} password reset`,
    text: `Hi ${safeName}, we received a request to reset your ${roleLabel} account password. This link expires in ${expiryMinutes} minutes: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p>Hi ${safeName},</p>
        <p>We received a request to reset the password for your ${roleLabel} account.</p>
        <p>
          <a
            href="${resetUrl}"
            style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 12px 18px; border-radius: 8px;"
          >
            Reset password
          </a>
        </p>
        <p>This link expires in ${expiryMinutes} minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};
