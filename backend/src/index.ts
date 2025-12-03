import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import candidateRoutes from './routes/candidateRoutes';
import scoreRoutes from './routes/scoreRoutes';
import aiRoutes from './routes/aiRoutes';
import recruiterRoutes from './routes/recruiterRoutes';
import reportRoutes from './routes/reportRoutes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins = clientOrigins.includes('*');

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({ message: 'Smart Competency Diagnostic API running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/reports', reportRoutes);

app.use(errorHandler);

const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

void startServer();
