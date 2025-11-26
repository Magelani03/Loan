import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../prisma/client.js';
import type { AuthRequest } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' });
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