/**
 * Seed script — populates the DB with Code Neptune Technologies sample data.
 * Run: npx ts-node src/seed.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User, Project, Task, WorkLog, Leave } from './models';
import { UserRole, ProjectStatus, TaskStatus, LeaveStatus } from './interfaces';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('🌱 Connected — seeding...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    WorkLog.deleteMany({}),
    Leave.deleteMany({}),
  ]);

  // ── Users ─────────────────────────────────────────────────────────────────
  const usersData = [
    { name: 'Arjun Mehta',   email: 'admin@codeneptune.com',   password: 'admin123',    role: UserRole.Admin    },
    { name: 'Priya Sharma',  email: 'priya@codeneptune.com',   password: 'password123', role: UserRole.Dev      },
    { name: 'Rahul Das',     email: 'rahul@codeneptune.com',   password: 'password123', role: UserRole.Dev      },
    { name: 'Sneha Nair',    email: 'sneha@codeneptune.com',   password: 'password123', role: UserRole.Designer },
    { name: 'Vikram Rao',    email: 'vikram@codeneptune.com',  password: 'password123', role: UserRole.QA       },
    { name: 'Deepa Iyer',    email: 'deepa@codeneptune.com',   password: 'password123', role: UserRole.BA       },
    { name: 'Kiran Patel',   email: 'kiran@codeneptune.com',   password: 'password123', role: UserRole.SEO      },
    { name: 'Ananya Gupta',  email: 'ananya@codeneptune.com',  password: 'password123', role: UserRole.Dev      },
  ];

  const users = await User.create(usersData);

  const admin = users[0];

  // ── Projects ──────────────────────────────────────────────────────────────
  const projects = await Project.insertMany([
    {
      name: 'Neptune CRM',
      clientName: 'TechCorp Ltd',
      category: 'Custom Product',
      description: 'Custom CRM platform for sales team',
      startDate: new Date('2025-01-01'),
      deadline: new Date('2025-06-30'),
      allocatedHours: 400,
      status: ProjectStatus.Active,
      createdBy: admin._id,
    },
    {
      name: 'AquaShop Redesign',
      clientName: 'AquaShop Pvt Ltd',
      category: 'Product',
      description: 'Full e-commerce redesign and SEO overhaul',
      startDate: new Date('2025-02-01'),
      deadline: new Date('2025-04-15'),
      allocatedHours: 200,
      status: ProjectStatus.Active,
      createdBy: admin._id,
    },
    {
      name: 'Internal EMS',
      clientName: 'Code Neptune Technologies',
      category: 'Product',
      description: 'Internal employee management system',
      startDate: new Date('2025-03-01'),
      deadline: new Date('2025-05-31'),
      allocatedHours: 600,
      status: ProjectStatus.Active,
      createdBy: admin._id,
    },
  ]);

  // ── Tasks ─────────────────────────────────────────────────────────────────
  const tasks = await Task.insertMany([
    {
      projectId: projects[0]._id,
      title: 'Build lead management module',
      description: 'CRUD for leads with pipeline stages',
      assignedTo: users[1]._id,
      roleTag: UserRole.Dev,
      status: TaskStatus.CurrentlyWorking,
      deadline: new Date('2025-03-20'),
      createdBy: admin._id,
    },
    {
      projectId: projects[0]._id,
      title: 'Design CRM dashboard wireframes',
      description: 'Mobile-first wireframes for all screens',
      assignedTo: users[3]._id,
      roleTag: UserRole.Designer,
      status: TaskStatus.TestingVerified,
      deadline: new Date('2025-03-10'),
      createdBy: admin._id,
    },
    {
      projectId: projects[1]._id,
      title: 'On-page SEO for product pages',
      description: 'Title tags, meta descriptions, structured data',
      assignedTo: users[6]._id,
      roleTag: UserRole.SEO,
      status: TaskStatus.MockupWorking,
      deadline: new Date('2025-03-25'),
      createdBy: admin._id,
    },
    {
      projectId: projects[2]._id,
      title: 'Write test cases for auth module',
      description: 'Login, registration, JWT refresh edge cases',
      assignedTo: users[4]._id,
      roleTag: UserRole.QA,
      status: TaskStatus.TestingStarted,
      deadline: new Date('2025-03-18'),
      createdBy: admin._id,
    },
    {
      projectId: projects[2]._id,
      title: 'API backend — work log endpoints',
      description: 'POST /logs, GET /logs, validation, daily cap',
      assignedTo: users[2]._id,
      roleTag: UserRole.Dev,
      status: TaskStatus.CurrentlyWorking,
      deadline: new Date('2025-03-22'),
      createdBy: admin._id,
    },
  ]);

  // ── Work Logs (today) ─────────────────────────────────────────────────────
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  await WorkLog.insertMany([
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
  await Leave.insertMany([
    {
      userId: users[3]._id,
      startDate: new Date('2025-03-14'),
      endDate: new Date('2025-03-15'),
      reason: 'Family function',
      status: LeaveStatus.Approved,
      reviewedBy: admin._id,
      reviewedAt: new Date(),
    },
    {
      userId: users[4]._id,
      startDate: new Date('2025-03-20'),
      endDate: new Date('2025-03-21'),
      reason: 'Personal work',
      status: LeaveStatus.Pending,
    },
  ]);

  console.log('✅ Seed complete!');
  console.log('─────────────────────────────────');
  console.log('Admin login:   admin@codeneptune.com / admin123');
  console.log('Employee login: priya@codeneptune.com / password123');
  console.log('─────────────────────────────────');

  await mongoose.disconnect();
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
