import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder, then from project root (so root .env is used when running from backend)
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Login and auth will fail.');
}
if (process.env.NODE_ENV === 'production' && !process.env.SMTP_HOST) {
  console.warn('SMTP_HOST is not set. Signup will return 503 until you set SMTP_HOST, SMTP_USER, SMTP_PASS (see backend/.env.example).');
}
