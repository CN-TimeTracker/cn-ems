# Code Neptune Technologies — EMS Backend

> Node.js · Express · TypeScript · MongoDB · Mongoose

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# → Fill in MONGODB_URI and JWT_SECRET

# 3. Seed sample data (optional)
npm run seed

# 4. Start dev server
npm run dev
```

Server runs at: `http://localhost:5000`  
Health check:   `http://localhost:5000/health`

---

## Project Structure

```
src/
├── app.ts                  ← Express app + server bootstrap
├── config/
│   └── db.ts               ← MongoDB connection
├── interfaces/
│   └── index.ts            ← All TypeScript types, enums, interfaces
├── models/
│   ├── User.model.ts
│   ├── Project.model.ts
│   ├── Task.model.ts
│   ├── WorkLog.model.ts
│   ├── Leave.model.ts
│   └── index.ts            ← Barrel export
├── services/               ← All business logic lives here
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── project.service.ts
│   ├── task.service.ts
│   ├── worklog.service.ts
│   ├── leave.service.ts
│   ├── dashboard.service.ts
│   └── index.ts
├── controllers/            ← HTTP layer only — delegates to services
│   ├── auth.controller.ts
│   ├── user.controller.ts
│   ├── project.controller.ts
│   ├── task.controller.ts
│   ├── worklog.controller.ts
│   ├── leave.controller.ts
│   ├── dashboard.controller.ts
│   └── index.ts
├── routes/                 ← Route definitions with middleware chains
│   ├── auth.routes.ts
│   ├── user.routes.ts
│   ├── project.routes.ts
│   ├── task.routes.ts
│   ├── worklog.routes.ts
│   ├── leave.routes.ts
│   ├── dashboard.routes.ts
│   └── index.ts
├── middleware/
│   ├── auth.middleware.ts  ← protect, adminOnly, roleGuard
│   ├── error.middleware.ts ← notFound, errorHandler, AppError
│   ├── validate.middleware.ts ← Zod schema wrapper
│   └── schemas.ts          ← All Zod validation schemas
├── utils/
│   └── asyncHandler.ts     ← Async route error wrapper
└── seed.ts                 ← Dev seed data
```

---

## Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/code-neptune-ems
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Scripts

| Command         | Description                    |
|----------------|--------------------------------|
| `npm run dev`  | Start with nodemon + ts-node   |
| `npm run build`| Compile TypeScript → dist/     |
| `npm start`    | Run compiled JS (production)   |
| `npm run seed` | Seed DB with sample data       |

---

## Seed Credentials

| Role     | Email                        | Password     |
|----------|------------------------------|--------------|
| Admin    | admin@codeneptune.com        | admin123     |
| Dev      | priya@codeneptune.com        | password123  |
| Dev      | rahul@codeneptune.com        | password123  |
| Designer | sneha@codeneptune.com        | password123  |
| QA       | vikram@codeneptune.com       | password123  |

---

## Key Business Rules (enforced in services)

1. **Work logs** — user can only log against tasks assigned to them
2. **Daily cap** — max 10 hours per day per user across all log entries
3. **Leave block** — cannot log on a day with approved leave
4. **Task ownership** — every task has exactly ONE assignee
5. **Status updates** — employees can only update task status, not reassign
6. **Soft delete** — users are deactivated, never hard deleted
7. **Accountability** — dashboard identifies: not-logged, under-4h, no-tasks, overdue

---

See `API.md` for full endpoint reference.
