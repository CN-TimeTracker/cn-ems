import { QueryClient } from '@tanstack/react-query';

// ─────────────────────────────────────────────
// QUERY CLIENT
// Single instance shared across the app
// ─────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep data fresh for 2 minutes before refetching in background
      staleTime: 1000 * 60 * 2,
      // Keep unused data in cache for 5 minutes
      gcTime: 1000 * 60 * 5,
      // Retry failed requests once before showing error
      retry: 1,
      // Don't refetch when window regains focus in dev
      refetchOnWindowFocus: process.env.NODE_ENV === 'production',
    },
    mutations: {
      // Mutations fail fast — no retries
      retry: 0,
    },
  },
});

export default queryClient;
