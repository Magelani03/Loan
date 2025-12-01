// @ts-nocheck
import { Router } from 'express';
import { prisma } from '../../prisma/client';
import { authenticate, adminOnly, type AuthRequest } from '../middleware/auth';

const router = Router();

// Helper to append a status change message to a loan
async function appendStatusMessage(loanId: string, byUserId: string | undefined, status: string, message?: string) {
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return null;

  const existingMessages = (loan.messages as any[]) || [];
  const newMessage = {
    at: new Date().toISOString(),
    by: byUserId,
    status,
    message,
  };

  const updatedMessages = [...existingMessages, newMessage];

  return prisma.loan.update({
    where: { id: loanId },
    data: {
      status,
      messages: updatedMessages,
    },
  });
}

// GET /api/admin/loans?status=pending|approved|rejected|all
router.get('/loans', authenticate, adminOnly, async (req: AuthRequest, res) => {
  const status = (req.query.status as string) || 'pending';

  const where: any = {};
  if (status !== 'all') {
    where.status = status;
  }

  const loans = await prisma.loan.findMany({
    where,
    orderBy: { dateApplied: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          surname: true,
          email: true,
          telephone: true,
        },
      },
    },
  });

  res.json(
    loans.map((loan) => ({
      id: loan.id,
      referenceNumber: loan.referenceNumber,
      amount: loan.amount,
      status: loan.status,
      dateApplied: loan.dateApplied,
      user: loan.user,
    })),
  );
});

// GET /api/admin/loans/:id
router.get('/loans/:id', authenticate, adminOnly, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      user: {
        include: {
          documents: true,
          guarantors: true,
        },
      },
    },
  });

  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  res.json(loan);
});

// POST /api/admin/loans/:id/decision
router.post('/loans/:id/decision', authenticate, adminOnly, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status, message } = req.body as { status: string; message?: string };

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = await appendStatusMessage(id, req.user?.id, status, message);
  if (!updated) return res.status(404).json({ error: 'Loan not found' });

  res.json(updated);
});

// POST /api/admin/loans/:id/money-sent
// Called after the admin has actually sent the money to the borrower (e.g. via their banking app).
router.post('/loans/:id/money-sent', authenticate, adminOnly, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { message } = req.body as { message?: string };

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  if (loan.status !== 'approved') {
    return res.status(400).json({ error: 'Money can only be marked as sent after approval' });
  }

  const updated = await appendStatusMessage(id, req.user?.id, 'money_sent', message);
  res.json(updated);
});

// POST /api/admin/loans/:id/payback-ongoing
// Called when the borrower starts paying back (admin has received the first repayment).
router.post('/loans/:id/payback-ongoing', authenticate, adminOnly, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { message } = req.body as { message?: string };

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  if (!['money_sent', 'approved'].includes(loan.status)) {
    return res.status(400).json({ error: 'Payback can only be marked ongoing after money is sent' });
  }

  const updated = await appendStatusMessage(id, req.user?.id, 'payback_ongoing', message);
  res.json(updated);
});

// POST /api/admin/loans/:id/complete
// Called when the loan has been fully repaid.
router.post('/loans/:id/complete', authenticate, adminOnly, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { message } = req.body as { message?: string };

  const loan = await prisma.loan.findUnique({ where: { id } });
  if (!loan) return res.status(404).json({ error: 'Loan not found' });

  if (!['payback_ongoing', 'money_sent', 'approved'].includes(loan.status)) {
    return res.status(400).json({ error: 'Loan can only be completed after payback has started' });
  }

  const updated = await appendStatusMessage(id, req.user?.id, 'complete', message);
  res.json(updated);
});

export default router;
