import { Router } from 'express';
import { prisma } from 'prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// PROFILE + DOCS
router.get('/', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: { documents: { select: { type: true, url: true } } },
  });

  if (!user) return res.status(404).json({ error: 'Not found' });

  const docs = {
    id: user.documents.find(d => d.type === 'id')?.url,
    payslip: user.documents.find(d => d.type === 'payslip')?.url,
    bank_statement: user.documents.find(d => d.type === 'bank_statement')?.url,
    proof_residence: user.documents.find(d => d.type === 'proof_residence')?.url,
  };

  res.json({
    name: user.name,
    surname: user.surname,
    email: user.email,
    document_id_url: docs.id,
    document_payslip_url: docs.payslip,
    document_bank_statement_url: docs.bank_statement,
    document_proof_residence_url: docs.proof_residence,
  });
});

// FULL DETAILS
router.get('/details', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

// UPDATE PROFILE
router.post('/update', authenticate, async (req: AuthRequest, res) => {
  const data = req.body;
  await prisma.user.update({
    where: { id: req.user!.id },
    data,
  });
  res.json({ ok: true });
});

export default router;