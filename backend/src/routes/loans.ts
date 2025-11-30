import { Router } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';


const router = Router();

router.get('/status', authenticate, async (req: AuthRequest, res) => {
  const loan = await prisma.loan.findFirst({
    where: { userId: req.user!.id },
    orderBy: { dateApplied: 'desc' },
  });
  if (!loan) return res.json({});

  const messages = loan.messages ? JSON.parse(loan.messages as string) : [];

  res.json({
    reference_number: loan.referenceNumber,
    name: (await prisma.user.findUnique({ where: { id: loan.userId } }))?.name,
    amount: loan.amount,
    date_applied: loan.dateApplied.toISOString().split('T')[0],
    status: loan.status,
    interest_rate: loan.interestRate,
    repayment_period: loan.repaymentPeriod,
    installment_amount: loan.installmentAmount,
    next_payment_due: loan.nextPaymentDue?.toISOString().split('T')[0],
    messages,
  });
});

router.get('/history', authenticate, async (req: AuthRequest, res) => {
  const loans = await prisma.loan.findMany({
    where: { userId: req.user!.id },
    select: { dateApplied: true, amount: true, status: true, referenceNumber: true },
    orderBy: { dateApplied: 'desc' },
  });
  res.json(loans.map((l: any) => ({
    date_applied: l.dateApplied.toISOString().split('T')[0],
    amount: l.amount,
    status: l.status,
    reference_number: l.referenceNumber,
  })));
});

router.post('/apply', authenticate, async (req: AuthRequest, res) => {
  const { amount, periodMonths } = req.body;
  const interestRate = periodMonths === 1 ? 5 : periodMonths === 3 ? 7 : 9;
  const installment = amount * (1 + interestRate / 100) / periodMonths;

  await prisma.loan.create({
    data: {
      userId: req.user!.id,
      amount,
      interestRate,
      repaymentPeriod: periodMonths,
      installmentAmount: installment,
      dueDate: new Date(Date.now() + periodMonths * 30 * 24 * 60 * 60 * 1000),
      periodMonths,
    },
  });
  res.json({ ok: true });
});

export default router;