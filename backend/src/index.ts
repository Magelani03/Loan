import './config/env';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import loanRouter from './routes/loans';
import uploadRouter from './routes/upload';
import adminRouter from './routes/admin';
import { startLoanReminderJob } from './jobs/loanReminders';

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/loan', loanRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/admin', adminRouter);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // Start background jobs after server is up
  startLoanReminderJob();
});
