# Code Neptune Technologies — EMS Frontend

> Next.js 14 App Router · TypeScript · Tailwind CSS · Redux Toolkit · TanStack Query

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local.example .env.local
# → Set NEXT_PUBLIC_API_URL to your backend URL

# 3. Start dev server
npm run dev
```

App runs at: `http://localhost:3000`

Make sure the backend (`ems-backend`) is running on port 5000 first.

---

## Project Structure

```
src/
├── app/                        ← Next.js App Router pages
│   ├── layout.tsx              ← Root layout (wraps in Providers)
│   ├── page.tsx                ← Redirects to /dashboard
│   ├── globals.css
│   ├── (auth)/login/           ← Public login page
│   └── (dashboard)/            ← Protected dashboard shell
│
├── components/
│   ├── layout/
│   │   ├── Providers.tsx       ← Redux + QueryClient + PersistGate
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── ui/                     ← Reusable primitives
│   └── [feature]/              ← Feature-specific components
│
├── services/                   ← Axios API calls (one file per resource)
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── project.service.ts
│   ├── task.service.ts
│   ├── worklog.service.ts
│   ├── leave.service.ts
│   ├── dashboard.service.ts
│   └── index.ts
│
├── hooks/                      ← TanStack Query hooks (consume services)
│   ├── useAuth.ts
│   ├── useUsers.ts
│   ├── useProjects.ts
│   ├── useTasks.ts
│   ├── useWorkLogs.ts
│   ├── useLeaves.ts
│   ├── useDashboard.ts
│   └── index.ts
│
├── store/                      ← Redux Toolkit
│   ├── index.ts                ← configureStore + redux-persist
│   ├── authSlice.ts            ← token, user, isAuthenticated
│   ├── uiSlice.ts              ← sidebar, toasts
│   └── hooks.ts                ← typed useAppDispatch / useAppSelector
│
├── lib/
│   ├── api.ts                  ← Axios instance + interceptors
│   ├── queryClient.ts          ← TanStack QueryClient config
│   ├── queryKeys.ts            ← All query key factories
│   └── utils.ts                ← cn() helper
│
├── types/
│   └── index.ts                ← All TS types + enums (mirrors backend)
│
└── middleware.ts               ← Next.js route protection (edge)
```

---

## State Architecture

| Concern | Tool | Why |
|---|---|---|
| JWT token + user | Redux (persisted) | Survives page refresh |
| Sidebar / toasts | Redux (not persisted) | UI resets on reload |
| Server data (projects, tasks etc.) | TanStack Query | Cache, background sync, dedup |
| Form state | Local `useState` | No need for global state |

---

## Data Flow

```
Component
  → calls hook  (e.g. useCreateLog)
  → hook calls  service  (e.g. WorkLogService.createLog)
  → service calls axios  (lib/api.ts — auto-injects JWT)
  → axios calls Express API  (localhost:5000/api/v1)
  → response updates TanStack Query cache
  → Redux toast notification shown
```

---

## Key Libraries

| Library | Version | Purpose |
|---|---|---|
| next | 14 | App Router, SSR, middleware |
| @reduxjs/toolkit | 2.x | Global state |
| redux-persist | 6.x | Persist auth to localStorage |
| @tanstack/react-query | 5.x | Server state, caching |
| axios | 1.x | HTTP client |
| tailwindcss | 3.x | Styling |
| lucide-react | latest | Icons |
| date-fns | 3.x | Date formatting |
| clsx + tailwind-merge | latest | Conditional class merging |
