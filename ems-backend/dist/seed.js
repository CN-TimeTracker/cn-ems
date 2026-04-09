"use strict";
/**
 * Seed script — populates the DB with Code Neptune Technologies sample data.
 * Run: npx ts-node src/seed.ts
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const models_1 = require("./models");
const interfaces_1 = require("./interfaces");
dotenv_1.default.config();
const seed = async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected — seeding...');
    // Clear existing data
    await Promise.all([
        models_1.User.deleteMany({}),
        models_1.Project.deleteMany({}),
        models_1.Task.deleteMany({}),
        models_1.WorkLog.deleteMany({}),
        models_1.Leave.deleteMany({}),
    ]);
    // ── Users ─────────────────────────────────────────────────────────────────
    const usersData = [
        { name: 'Arjun Mehta', email: 'admin@codeneptune.com', password: 'admin123', role: interfaces_1.UserRole.Admin },
        { name: 'Priya Sharma', email: 'priya@codeneptune.com', password: 'password123', role: interfaces_1.UserRole.Dev },
        { name: 'Rahul Das', email: 'rahul@codeneptune.com', password: 'password123', role: interfaces_1.UserRole.Dev },
        { name: 'Sneha Nair', email: 'sneha@codeneptune.com', password: 'password123', role: interfaces_1.UserRole.Designer },
        { name: 'Vikram Rao', email: 'vikram@codeneptune.com', password: 'password123', role: interfaces_1.UserRole.QA },
        { name: 'Deepa Iyer', email: 'deepa@codeneptune.com', password: 'password123', role: interfaces_1.UserRole.BA },
        { name: 'Kiran Patel', email: 'kiran@codeneptune.com', password: 'password123', role: interfaces_1.UserRole.SEO },
        { name: 'Ananya Gupta', email: 'ananya@codeneptune.com', password: 'password123', role: interfaces_1.UserRole.Dev },
    ];
    const users = await models_1.User.create(usersData);
    const admin = users[0];
    // ── Projects ──────────────────────────────────────────────────────────────
    const projects = await models_1.Project.insertMany([
        {
            name: 'Neptune CRM',
            clientName: 'TechCorp Ltd',
            description: 'Custom CRM platform for sales team',
            startDate: new Date('2025-01-01'),
            deadline: new Date('2025-06-30'),
            status: interfaces_1.ProjectStatus.Active,
            createdBy: admin._id,
        },
        {
            name: 'AquaShop Redesign',
            clientName: 'AquaShop Pvt Ltd',
            description: 'Full e-commerce redesign and SEO overhaul',
            startDate: new Date('2025-02-01'),
            deadline: new Date('2025-04-15'),
            status: interfaces_1.ProjectStatus.Active,
            createdBy: admin._id,
        },
        {
            name: 'Internal EMS',
            clientName: 'Code Neptune Technologies',
            description: 'Internal employee management system',
            startDate: new Date('2025-03-01'),
            deadline: new Date('2025-05-31'),
            status: interfaces_1.ProjectStatus.Active,
            createdBy: admin._id,
        },
    ]);
    // ── Tasks ─────────────────────────────────────────────────────────────────
    const tasks = await models_1.Task.insertMany([
        {
            projectId: projects[0]._id,
            title: 'Build lead management module',
            description: 'CRUD for leads with pipeline stages',
            assignedTo: users[1]._id,
            roleTag: interfaces_1.UserRole.Dev,
            status: interfaces_1.TaskStatus.InProgress,
            deadline: new Date('2025-03-20'),
            createdBy: admin._id,
        },
        {
            projectId: projects[0]._id,
            title: 'Design CRM dashboard wireframes',
            description: 'Mobile-first wireframes for all screens',
            assignedTo: users[3]._id,
            roleTag: interfaces_1.UserRole.Designer,
            status: interfaces_1.TaskStatus.Done,
            deadline: new Date('2025-03-10'),
            createdBy: admin._id,
        },
        {
            projectId: projects[1]._id,
            title: 'On-page SEO for product pages',
            description: 'Title tags, meta descriptions, structured data',
            assignedTo: users[6]._id,
            roleTag: interfaces_1.UserRole.SEO,
            status: interfaces_1.TaskStatus.ToDo,
            deadline: new Date('2025-03-25'),
            createdBy: admin._id,
        },
        {
            projectId: projects[2]._id,
            title: 'Write test cases for auth module',
            description: 'Login, registration, JWT refresh edge cases',
            assignedTo: users[4]._id,
            roleTag: interfaces_1.UserRole.QA,
            status: interfaces_1.TaskStatus.InProgress,
            deadline: new Date('2025-03-18'),
            createdBy: admin._id,
        },
        {
            projectId: projects[2]._id,
            title: 'API backend — work log endpoints',
            description: 'POST /logs, GET /logs, validation, daily cap',
            assignedTo: users[2]._id,
            roleTag: interfaces_1.UserRole.Dev,
            status: interfaces_1.TaskStatus.InProgress,
            deadline: new Date('2025-03-22'),
            createdBy: admin._id,
        },
    ]);
    // ── Work Logs (today) ─────────────────────────────────────────────────────
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    await models_1.WorkLog.insertMany([
        {
            userId: users[1]._id,
            projectId: projects[0]._id,
            taskId: tasks[0]._id,
            hours: 6,
            notes: 'Implemented lead CRUD, 80% done',
            date: today,
        },
        {
            userId: users[2]._id,
            projectId: projects[2]._id,
            taskId: tasks[4]._id,
            hours: 3,
            notes: 'POST /logs endpoint done, working on validation',
            date: today,
        },
    ]);
    // ── Leaves ────────────────────────────────────────────────────────────────
    await models_1.Leave.insertMany([
        {
            userId: users[3]._id,
            startDate: new Date('2025-03-14'),
            endDate: new Date('2025-03-15'),
            reason: 'Family function',
            status: interfaces_1.LeaveStatus.Approved,
            reviewedBy: admin._id,
            reviewedAt: new Date(),
        },
        {
            userId: users[4]._id,
            startDate: new Date('2025-03-20'),
            endDate: new Date('2025-03-21'),
            reason: 'Personal work',
            status: interfaces_1.LeaveStatus.Pending,
        },
    ]);
    console.log('✅ Seed complete!');
    console.log('─────────────────────────────────');
    console.log('Admin login:   admin@codeneptune.com / admin123');
    console.log('Employee login: priya@codeneptune.com / password123');
    console.log('─────────────────────────────────');
    await mongoose_1.default.disconnect();
};
seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map