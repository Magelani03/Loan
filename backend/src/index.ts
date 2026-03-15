import dns from 'dns';
// Prefer IPv4 for outbound connections (avoids ENETUNREACH to Gmail etc. on hosts with broken IPv6)
dns.setDefaultResultOrder('ipv4first');

import './config/env';
import path from 'path';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import loanRouter from './routes/loans';
import uploadRouter from './routes/upload';
import adminRouter, { statsHandler } from './routes/admin';
import { authenticate, adminOnly } from './middleware/auth';
import { startLoanReminderJob } from './jobs/loanReminders';

const app = express();

// Allow CORS for browser clients (frontend + admin). In production you can
// restrict this with an env var if needed.
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads', {
  setHeaders: (res, filePath) => {
    const ext = filePath ? path.extname(filePath).toLowerCase() : '';
    if (!ext || !['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      res.setHeader('Content-Type', 'application/pdf');
    }
  },
}));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/loan', loanRouter);
app.use('/api/upload', uploadRouter);
// Register stats explicitly so GET /api/admin/stats is always available
app.get('/api/admin/stats', ...[authenticate, adminOnly, statsHandler] as express.RequestHandler[]);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Start background jobs after server is up
  startLoanReminderJob();
});
