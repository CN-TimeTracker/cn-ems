"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = __importDefault(require("./config/db"));
const error_middleware_1 = require("./middleware/error.middleware");
// Routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const task_routes_1 = __importDefault(require("./routes/task.routes"));
const worklog_routes_1 = __importDefault(require("./routes/worklog.routes"));
const leave_routes_1 = __importDefault(require("./routes/leave.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const profile_routes_1 = __importDefault(require("./routes/profile.routes"));
const payslip_routes_1 = __importDefault(require("./routes/payslip.routes"));
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const holiday_routes_1 = __importDefault(require("./routes/holiday.routes"));
const cron_service_1 = require("./services/cron.service");
// ─────────────────────────────────────────────
// BOOTSTRAP
// ─────────────────────────────────────────────
dotenv_1.default.config();
(0, db_1.default)();
cron_service_1.CronService.init();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// ─────────────────────────────────────────────
// SECURITY MIDDLEWARE
// ─────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
// Global rate limiter — 100 requests per 15 minutes per IP
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);
// Stricter limiter on auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, message: 'Too many login attempts. Please try again later.' },
});
app.use('/api/v1/auth/login', authLimiter);
// ─────────────────────────────────────────────
// GENERAL MIDDLEWARE
// ─────────────────────────────────────────────
app.use(express_1.default.json({ limit: '10kb' }));
app.use(express_1.default.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') {
    app.use((0, morgan_1.default)('dev'));
}
// Serve uploads folder statically
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
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
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', user_routes_1.default);
app.use('/api/v1/projects', project_routes_1.default);
app.use('/api/v1/tasks', task_routes_1.default);
app.use('/api/v1/logs', worklog_routes_1.default);
app.use('/api/v1/leaves', leave_routes_1.default);
app.use('/api/v1/dashboard', dashboard_routes_1.default);
app.use('/api/v1/attendance', attendance_routes_1.default);
app.use('/api/v1/profile', profile_routes_1.default);
app.use('/api/v1/payslips', payslip_routes_1.default);
app.use('/api/v1/events', event_routes_1.default);
app.use('/api/v1/holidays', holiday_routes_1.default);
// ─────────────────────────────────────────────
// ERROR HANDLING (must be last)
// ─────────────────────────────────────────────
app.use(error_middleware_1.notFound);
app.use(error_middleware_1.errorHandler);
// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 Code Neptune EMS API running on port ${PORT}`);
    console.log(`📍 Environment : ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});
exports.default = app;
//# sourceMappingURL=app.js.map