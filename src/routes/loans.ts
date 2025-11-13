import { Router } from 'express';
import { prisma } from 'prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// LATEST LOAN STATUS
router.get('/status', authenticate, async (req: AuthRequest, res) => {
  const loan = await prisma.loan.findFirst({
    where: { userId: req.user!.id },
    orderBy: { dateApplied: 'desc' },
  });

  if (!loan) return res.json({});

  const messages = loan.messages ? JSON.parse(JSON.stringify(loan.messages)) : [];

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

// HISTORY
router.get('/history', authenticate, async (req: AuthRequest, res) => {
  const loans = await prisma.loan.findMany({
    where: { userId: req.user!.id },
    select: {
      dateApplied: true,
      amount: true,
      status: true,
      referenceNumber: true,
    },
    orderBy: { dateApplied: 'desc' },
  });

  res.json(
    loans.map(l => ({
      date_applied: l.dateApplied.toISOString().split('T')[0],
      amount: l.amount,
      status: l.status,
      reference_number: l.referenceNumber,
    }))
  );
});

export default router;