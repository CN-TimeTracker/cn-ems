'use client';

import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import * as AttendanceService from '@/services/attendance.service';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { Clock, CheckCircle2, AlertTriangle, UserX, LogOut } from 'lucide-react';

// Helpers
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function formatTimeIST(dateString: string | null): string {
  if (!dateString) return '—';
  const utcMs = new Date(dateString).getTime();
  const istMs = utcMs + IST_OFFSET_MS;
  const ist   = new Date(istMs);
  const h24   = ist.getUTCHours();
  const ampm  = h24 >= 12 ? 'PM' : 'AM';
  const h12   = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm    = String(ist.getUTCMinutes()).padStart(2, '0');
  return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
}

function formatDurationParts(ms: number) {
  const m = Math.floor(ms / 60000);
  const h = Math.floor(m / 60);
  const remM = m % 60;
  if (h === 0 && remM === 0) return '0m';
  if (h === 0) return `${remM}m`;
  return `${h}h ${remM}m`;
}

export default function AttendancePage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const router = useRouter();

  // Redirect non-admins
  if (currentUser && currentUser.role !== UserRole.Admin) {
    router.replace('/dashboard');
    return null;
  }

  const { data: attendanceData, isLoading } = useQuery({
    queryKey:  ['attendance', 'admin', 'today'],
    queryFn:   AttendanceService.getAdminTodayView,
    staleTime: 60_000,
    refetchInterval: 60 * 1000, // refresh every minute
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const data = attendanceData || [];
  
  // Sort: working -> finished -> late -> not checked in
  const sorted = [...data].sort((a, b) => {
    if (a.hasPunchedIn && !b.hasPunchedIn) return -1;
    if (!a.hasPunchedIn && b.hasPunchedIn) return 1;
    if (a.hasPunchedIn && b.hasPunchedIn) {
      if (!a.hasPunchedOut && b.hasPunchedOut) return -1;
      if (a.hasPunchedOut && !b.hasPunchedOut) return 1;
      if (!a.isLate && b.isLate) return -1;
      if (a.isLate && !b.isLate) return 1;
    }
    return 0;
  });

  const checkedIn = data.filter(e => e.hasPunchedIn);
  const notCheckedIn = data.filter(e => !e.hasPunchedIn);
  const lateCount = checkedIn.filter(e => e.isLate).length;
  const punchedOut = checkedIn.filter(e => e.hasPunchedOut).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Today's Attendance</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {checkedIn.length} present · {notCheckedIn.length} absent · {punchedOut} finished
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <EmptyState title="No records" description="No active employee records found." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Employee</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Status</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Punch In</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Break Time</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Punch Out</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Late Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {sorted.map((entry) => (
                  <tr key={entry.user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          !entry.hasPunchedIn ? 'bg-gray-100 text-gray-400' 
                          : entry.hasPunchedOut ? 'bg-gray-100 text-gray-500'
                          : entry.isLate ? 'bg-amber-100 text-amber-700' 
                          : 'bg-green-100 text-green-700'
                        }`}>
                          {entry.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{entry.user.name}</p>
                          <p className="text-xs text-gray-500">{entry.user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {!entry.hasPunchedIn ? (
                        <Badge variant="default" className="gap-1 bg-gray-100 text-gray-500 hover:bg-gray-100">
                          <UserX className="w-3 h-3" /> Absent
                        </Badge>
                      ) : entry.hasPunchedOut ? (
                        <Badge variant="default" className="gap-1 bg-gray-100 text-gray-600 border-gray-200">
                          <LogOut className="w-3 h-3" /> Finished
                        </Badge>
                      ) : entry.isLate ? (
                        <Badge variant="warning" className="gap-1">
                          <AlertTriangle className="w-3 h-3" /> Late
                        </Badge>
                      ) : (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" /> On Time
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {formatTimeIST(entry.punchInTime)}
                    </td>
                    <td className="px-6 py-4 font-medium text-brand-600 whitespace-nowrap">
                      {entry.totalBreakMs > 0 ? formatDurationParts(entry.totalBreakMs) : '—'}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                      {formatTimeIST(entry.punchOutTime ?? null)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 italic max-w-xs truncate">
                      {entry.lateReason || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
