# Code Neptune Technologies — EMS

> Full-stack Employee Management System

## Structure

```
code-neptune-ems/
├── ems-backend/     Node.js · Express · TypeScript · MongoDB
└── ems-frontend/    Next.js 14 · TypeScript · Tailwind · Redux · TanStack Query
```

## Setup

### 1. Backend
```bash
cd ems-backend
npm install
cp .env.example .env        # fill in MONGODB_URI + JWT_SECRET
npm run seed                 # optional: load sample data
npm run dev                  # runs on http://localhost:5000
```

### 2. Frontend
```bash
cd ems-frontend
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev                         # runs on http://localhost:3000
```

## Seed Login Credentials
| Role     | Email                       | Password     |
|----------|-----------------------------|--------------|
| Admin    | admin@codeneptune.com       | admin123     |
| Dev      | priya@codeneptune.com       | password123  |
| Designer | sneha@codeneptune.com       | password123  |
| QA       | vikram@codeneptune.com      | password123  |
