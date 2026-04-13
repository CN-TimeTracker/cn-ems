import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import connectDB from './config/db';
import { notFound, errorHandler } from './middleware/error.middleware';

// Routes
import authRoutes       from './routes/auth.routes';
import userRoutes       from './routes/user.routes';
import projectRoutes    from './routes/project.routes';
import taskRoutes       from './routes/task.routes';
import worklogRoutes    from './routes/worklog.routes';
import leaveRoutes      from './routes/leave.routes';
import dashboardRoutes  from './routes/dashboard.routes';
import attendanceRoutes from './routes/attendance.routes';
import profileRoutes    from './routes/profile.routes';
import payslipRoutes    from './routes/payslip.routes';
import eventRoutes      from './routes/event.routes';
import holidayRoutes    from './routes/holiday.routes';
import { CronService }  from './services/cron.service';
import { TimeService }  from './services/time.service';

// ─────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────

dotenv.config();
connectDB();
TimeService.init();
CronService.init();

const app = express();
const PORT = process.env.PORT || 5000;

// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────────

app.use(helmet());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Global rate limiter — 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
// app.use('/api', limiter);

// Stricter limiter on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
// app.use('/api/v1/auth/login', authLimiter);

// ─────────────────────────────────────────────
// GENERAL MIDDLEWARE
// ─────────────────────────────────────────────

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Code Neptune EMS API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ─────────────────────────────────────────────
// API ROUTES
// ─────────────────────────────────────────────

app.use('/api/v1/auth',       authRoutes);
app.use('/api/v1/users',      userRoutes);
app.use('/api/v1/projects',   projectRoutes);
app.use('/api/v1/tasks',      taskRoutes);
app.use('/api/v1/logs',       worklogRoutes);
app.use('/api/v1/leaves',     leaveRoutes);
app.use('/api/v1/dashboard',  dashboardRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/profile',    profileRoutes);
app.use('/api/v1/payslips',   payslipRoutes);
app.use('/api/v1/events',     eventRoutes);
app.use('/api/v1/holidays',   holidayRoutes);

// ─────────────────────────────────────────────
// ERROR HANDLING (must be last)
// ─────────────────────────────────────────────

app.use(notFound);
app.use(errorHandler);

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n🚀 Code Neptune EMS API running on port ${PORT}`);
  console.log(`📍 Environment : ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});

export default app;
