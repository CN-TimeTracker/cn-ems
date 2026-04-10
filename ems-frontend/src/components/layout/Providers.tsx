'use client';

import { ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store, persistor } from '@/store';
import queryClient from '@/lib/queryClient';
import Spinner from '@/components/ui/Spinner';

// ─────────────────────────────────────────────
// PROVIDERS
// Single wrapper that gives every page access to:
//  1. Redux store  (auth + ui state)
//  2. PersistGate  (waits for sessionStorage hydration before render)
//  3. React Query  (server state + caching)
// ─────────────────────────────────────────────

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ReduxProvider store={store}>
      {/* PersistGate blocks render until Redux is rehydrated from sessionStorage */}
      <PersistGate
        loading={
          <div className="flex h-screen items-center justify-center bg-gray-50">
            <Spinner size="lg" />
          </div>
        }
        persistor={persistor}
      >
        <QueryClientProvider client={queryClient}>
          {children}

          {/* TanStack Query devtools — only in development */}
          {/* {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} position="bottom" />
          )} */}
        </QueryClientProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
