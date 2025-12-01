// @ts-nocheck
import { Router } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { documents: true },
  });
  if (!user) return res.status(404).json({ error: 'Not found' });

  const docsArray = user.documents;
  type Doc = (typeof docsArray)[number];

  const docs = {
    id: docsArray.find((d: Doc) => d.type === 'id')?.url,
    payslip: docsArray.find((d: Doc) => d.type === 'payslip')?.url,
    bank_statement: docsArray.find((d: Doc) => d.type === 'bank_statement')?.url,
    proof_residence: docsArray.find((d: Doc) => d.type === 'proof_residence')?.url,
  };

  const avatar = docsArray.find((d: Doc) => d.type === 'avatar')?.url ?? null;

  res.json({
    name: user.name,
    surname: user.surname,
    email: user.email,
    avatar,
    ...docs,
  });
});

router.get('/details', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  res.json(user || {});
});

router.post('/update', authenticate, async (req: AuthRequest, res) => {
  await prisma.user.update({ where: { id: req.user!.id }, data: req.body });
  res.json({ ok: true });
});

export default router;
