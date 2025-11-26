import { Router } from 'express';
import { prisma } from '../prisma/client.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET!;
const SALT = 10;

router.post('/signup', async (req, res) => {
  const { name, surname, email, password } = req.body;
  const hashed = await bcrypt.hash(password, SALT);
  try {
    const user = await prisma.user.create({
      data: { name, surname, email, password: hashed },
    });
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email, name } });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email, name: user.name } });
});

export default router;