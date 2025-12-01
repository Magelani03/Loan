import { Router } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate } from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to generate a human-friendly reference number: initials + 5 random alphanumeric chars
function generateReferenceNumber(name: string | null, surname: string | null): string {
  const firstInitial = (name?.trim()[0] ?? 'U').toUpperCase();
  const lastInitial = (surname?.trim()[0] ?? 'N').toUpperCase();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 5; i += 1) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }
  return `${firstInitial}${lastInitial}-${randomPart}`;
}

router.get('/status', authenticate, async (req: AuthRequest, res) => {
  const loan = await prisma.loan.findFirst({
    where: { userId: req.user!.id },
    orderBy: { dateApplied: 'desc' },
  });
  if (!loan) return res.json({});

  // `messages` is a Prisma Json field; it's already returned as a JS value (object/array/string).
  // Avoid JSON.parse here to prevent "[object Object] is not valid JSON" errors.
  const rawMessages = loan.messages as unknown;
  const messages =
    typeof rawMessages === 'string'
      ? JSON.parse(rawMessages)
      : (rawMessages ?? []);

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

// Public stats for the marketing homepage
router.get('/stats', async (_req, res) => {
  try {
    const totalLoans = await prisma.loan.count();
    const activeLoans = await prisma.loan.count({
      where: {
        status: {
          in: ['pending', 'approved', 'money_sent', 'payback_ongoing'],
        },
      },
    });
    const borrowers = await prisma.loan.findMany({
      select: { userId: true },
      distinct: ['userId'],
    });
    const totals = await prisma.loan.aggregate({
      _sum: { amount: true },
      where: {
        status: {
          in: ['money_sent', 'payback_ongoing', 'complete'],
        },
      },
    });

    // status breakdown
    const grouped = await prisma.loan.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const statusCounts: Record<string, number> = {};
    grouped.forEach((g) => {
      statusCounts[g.status] = g._count._all;
    });

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last30 = await prisma.loan.aggregate({
      _count: { _all: true },
      _sum: { amount: true },
      where: {
        dateApplied: { gte: since },
      },
    });

    res.json({
      totalLoans,
      activeLoans,
      totalBorrowers: borrowers.length,
      totalLoaned: totals._sum.amount ?? 0,
      statusCounts,
      last30Days: {
        newLoans: last30._count._all ?? 0,
        totalLoaned: last30._sum.amount ?? 0,
      },
    });
  } catch (e: any) {
    console.error('Error in /api/loan/stats:', e);
    res.status(500).json({ error: 'Failed to load stats.' });
  }
});

router.post('/apply', authenticate, async (req: AuthRequest, res) => {
  const { amount, periodMonths, guarantorName, guarantorContact } = req.body;

  // Enforce single active loan per user: block if there is a non-completed, non-rejected loan.
  const activeLoan = await prisma.loan.findFirst({
    where: {
      userId: req.user!.id,
      status: {
        notIn: ['complete', 'rejected'],
      },
    },
  });

  if (activeLoan) {
    return res.status(400).json({ error: 'You already have an active loan. You can only apply again after completing repayment.' });
  }

  // Flat 30% interest rate
  const interestRate = 30;
  const installment = amount * (1 + interestRate / 100) / periodMonths;

  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  const referenceNumber = generateReferenceNumber(user?.name ?? null, user?.surname ?? null);

  const loan = await prisma.loan.create({
    data: {
      userId: req.user!.id,
      amount,
      interestRate,
      repaymentPeriod: periodMonths,
      installmentAmount: installment,
      dueDate: new Date(Date.now() + periodMonths * 30 * 24 * 60 * 60 * 1000),
      periodMonths,
      referenceNumber,
    },
  });

  // Persist guarantor details (if provided) so they show up on the admin loan detail view.
  if (guarantorName && guarantorContact) {
    await prisma.guarantor.create({
      data: {
        userId: req.user!.id,
        name: guarantorName,
        contact: guarantorContact,
      },
    });
  }

  res.json({ ok: true, referenceNumber: loan.referenceNumber });
});

export default router;