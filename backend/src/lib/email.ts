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

export function isEmailConfigured(): boolean {
  return Boolean(transport);
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!transport) {
    console.error('Email transport is not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS (and optionally SMTP_PORT, EMAIL_FROM).');
    console.log('Intended email:', { to, subject });
    throw new Error('EMAIL_NOT_CONFIGURED');
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
