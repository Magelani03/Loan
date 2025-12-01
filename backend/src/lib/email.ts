import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM,
} = process.env;

const transport = SMTP_HOST
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT ? Number(SMTP_PORT) : 587,
      secure: false,
      auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    })
  : null;

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transport) {
    // Fallback for development if SMTP is not configured
    console.error('Email transport is not configured', {
      SMTP_HOST,
      SMTP_PORT,
      hasUser: Boolean(SMTP_USER),
      hasPass: Boolean(SMTP_PASS),
    });
    console.log('Email sending is not configured. Intended email:', { to, subject });
    return;
  }

  try {
    await transport.sendMail({
      from: EMAIL_FROM || SMTP_USER,
      to,
      subject,
      html,
    });
    console.log('Email sent successfully', { to, subject });
  } catch (err) {
    console.error('Error sending email via SMTP', {
      to,
      subject,
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}
