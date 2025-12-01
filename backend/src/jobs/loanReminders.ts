import { prisma } from '../../prisma/client';

// Run periodically to add an automatic reminder message when a loan reaches its due date
// and payback has not started yet.
export function startLoanReminderJob() {
  const intervalMs = 60 * 60 * 1000; // every hour

  setInterval(async () => {
    const now = new Date();

    try {
      const loans = await prisma.loan.findMany({
        where: {
          dueDate: { lte: now },
          status: {
            in: ['approved', 'money_sent'],
          },
        },
      });

      for (const loan of loans) {
        const existing = (loan.messages as any[]) || [];
        const alreadyReminded = existing.some((m: any) => m?.status === 'due_reminder');
        if (alreadyReminded) continue;

        const newMessage = {
          at: now.toISOString(),
          by: null,
          status: 'due_reminder',
          message:
            'Your repayment period has ended. Please start paying back your loan as agreed.',
        };

        await prisma.loan.update({
          where: { id: loan.id },
          data: {
            messages: [...existing, newMessage],
          },
        });
      }
    } catch (e) {
      console.error('Loan reminder job error', e);
    }
  }, intervalMs);
}
