import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend folder, then from project root (so root .env is used when running from backend)
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Login and auth will fail.');
}
