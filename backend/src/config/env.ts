import dotenv from 'dotenv';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Login and auth will fail.');
}
