import { Router } from 'express';
import multer from 'multer';
import { prisma } from 'prisma/client.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/document', authenticate, upload.single('file'), async (req: AuthRequest, res) => {
  const { type } = req.body;
  const url = `/uploads/${req.file!.filename}`;

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