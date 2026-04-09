'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/ui/ToastContainer';
import LateReasonModal from '@/components/dashboard/LateReasonModal';
import CelebrationFloat from '@/components/dashboard/CelebrationFloat';
import { useMidnightLogout } from '@/hooks';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Activate auto-logout at midnight
  useMidnightLogout();

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>

        {/* Late Reason Modal (Global check) */}
        <LateReasonModal />

        {/* Celebration Notification */}
        <CelebrationFloat />

        {/* Toast notifications */}
        <ToastContainer />
      </div>
    </AuthGuard>
  );
}