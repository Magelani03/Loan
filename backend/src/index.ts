import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.js';
import userRouter from './routes/user.js';
import loanRouter from './routes/loans.js';  // ← Fixed name
import uploadRouter from './routes/upload.js';

dotenv.config();
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

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});