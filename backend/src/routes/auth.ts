import { Router } from 'express';
import { prisma } from '../../prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendEmail } from '../lib/email';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const SALT = 10;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.post('/signup', async (req, res) => {
  try {
    const { name, surname, email, password } = req.body ?? {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const hashed = await bcrypt.hash(String(password), SALT);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    try {
      await prisma.user.create({
        data: {
          name,
          surname,
          email,
          password: hashed,
          emailVerified: false,
          verificationToken,
          verificationTokenExpires,
        },
      });

      const verifyLink = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;

      await sendEmail(
        email,
        'Verify your email address',
        `<p>Hi ${name ?? ''},</p>
         <p>Thanks for signing up. Please confirm your email address by clicking the link below:</p>
         <p><a href="${verifyLink}">Verify Email</a></p>
         <p>If you did not create an account, you can ignore this email.</p>`,
      );

      res.json({ ok: true, message: 'Signup successful. Please check your email to verify your account.' });
    } catch (e: any) {
      console.error('Error during /signup persistence/email:', e);
      const isDuplicateEmail =
        e?.code === 'P2002' ||
        (typeof e?.message === 'string' && e.message.toLowerCase().includes('unique constraint'));
      const message = isDuplicateEmail
        ? 'This email is already registered. Try logging in or use a different email.'
        : (e?.message || 'Failed to create user.');
      res.status(400).json({ error: message });
    }
  } catch (e: any) {
    console.error('Unexpected error in /signup handler:', e);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.emailVerified === false) {
    return res.status(403).json({ error: 'Please verify your email address before logging in.' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email, name: user.name, role: user.role } });
});

router.get('/verify-email', async (req, res) => {
  const token = req.query.token;
  if (typeof token !== 'string') {
    return res.status(400).json({ error: 'Missing token' });
  }

  const user = await prisma.user.findFirst({
    where: {
      verificationToken: token,
      verificationTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ error: 'Invalid or expired verification token.' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  });

  res.json({ ok: true, message: 'Email verified successfully.' });
});

export default router;
