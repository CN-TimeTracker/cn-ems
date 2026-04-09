'use client';

import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole } from '@/types';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/EmployeeDashboard';
import Spinner from '@/components/ui/Spinner';

export default function DashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return user.role === UserRole.Admin
    ? <AdminDashboard />
    : <EmployeeDashboard />;
}