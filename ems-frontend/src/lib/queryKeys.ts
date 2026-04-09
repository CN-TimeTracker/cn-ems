// ─────────────────────────────────────────────
// QUERY KEYS
// Single source of truth for all query/mutation keys.
// Using factory functions keeps keys structured and
// makes targeted cache invalidation trivial.
// ─────────────────────────────────────────────

export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Users
  users: {
    all:     ()         => ['users'] as const,
    active:  ()         => ['users', 'active'] as const,
    detail:  (id: string) => ['users', id] as const,
  },

  // Projects
  projects: {
    all:       ()           => ['projects'] as const,
    active:    ()           => ['projects', 'active'] as const,
    assigned:  ()           => ['projects', 'assigned'] as const,
    detail:    (id: string) => ['projects', id] as const,
    remaining: (id: string) => ['projects', id, 'remaining'] as const,
  },

  // Tasks
  tasks: {
    all:     (filters?: object) => ['tasks', filters ?? {}] as const,
    my:      ()                 => ['tasks', 'my'] as const,
    overdue: ()                 => ['tasks', 'overdue'] as const,
    detail:  (id: string)       => ['tasks', id] as const,
  },

  // Work Logs
  logs: {
    all:     (filters?: object) => ['logs', filters ?? {}] as const,
    my:      (filters?: object) => ['logs', 'my', filters ?? {}] as const,
    today:   ()                 => ['logs', 'today'] as const,
    summary: ()                 => ['logs', 'projects', 'summary'] as const,
  },

  // Leaves
  leaves: {
    all:     (filters?: object) => ['leaves', filters ?? {}] as const,
    pending: ()                 => ['leaves', 'pending'] as const,
  },

  // Dashboard
  dashboard: {
    admin:    () => ['dashboard', 'admin'] as const,
    employee: () => ['dashboard', 'employee'] as const,
  },

  // Events
  events: {
    all:    ()           => ['events'] as const,
    detail: (id: string) => ['events', id] as const,
  },
} as const;
