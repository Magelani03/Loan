// @ts-nocheck
import { Router } from 'express';
import path from 'path';
import crypto from 'crypto';
import multer = require('multer');
import { authenticate } from '../middleware/auth';
import { prisma } from '../../prisma/client';
import type { AuthRequest } from '../middleware/auth';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, 'uploads/'),
  filename: (_req, file, cb) => {
    const ext = (path.extname(file.originalname) || '').toLowerCase().replace(/[^a-z0-9.]/g, '') || '.bin';
    const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
    const name = `${crypto.randomBytes(12).toString('hex')}${safeExt}`;
    cb(null, name);
  },
});
const upload = multer({ storage });
const router = Router();

router.post('/document', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const { type } = req.body;
  const url = `/uploads/${req.file.filename}`;

  await prisma.document.create({
    data: {
      userId: req.user!.id,
      type,
      url,
    },
  });

  res.json({ url });
});

export default router;