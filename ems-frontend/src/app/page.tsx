import { redirect } from 'next/navigation';

// Root page just redirects — actual routing handled by middleware
// Authenticated → /dashboard
// Not authenticated → /login (middleware handles this)

export default function RootPage() {
  redirect('/dashboard');
}
