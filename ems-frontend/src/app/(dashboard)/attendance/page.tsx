'use client';

import { useState, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole } from '@/types';
import { useRouter } from 'next/navigation';
import { useAllAttendance, useActiveEmployees } from '@/hooks';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { Clock, CheckCircle2, AlertTriangle, UserX, LogOut, Filter, Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import { formatAppDate } from '@/lib/dateUtils';

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

  // Filters State
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const startPickerRef = useRef<HTMLInputElement>(null);
  const endPickerRef = useRef<HTMLInputElement>(null);

  const { data: employees } = useActiveEmployees();
  const { data: attendanceData, isLoading } = useAllAttendance(filters);

  // Redirect non-admins
  if (currentUser && currentUser.role !== UserRole.Admin) {
    router.replace('/dashboard');
    return null;
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleDateFilterChange = (key: 'startDate' | 'endDate', value: string) => {
    const displayKey = key === 'startDate' ? 'displayStartDate' : 'displayEndDate';
    setFilters((prev: any) => {
      const next = { ...prev, [displayKey]: value };
      
      const parts = value.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1000) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          next[key] = iso;
        } else {
          delete next[key];
        }
      } else if (!value) {
        delete next[key];
      }
      return next;
    });
  };

  const clearFilters = () => setFilters({});

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const data = attendanceData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Attendance History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View and filter employee attendance records
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary ${showFilters ? 'bg-gray-100' : ''}`}
        >
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* FILTERS BAR */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employee Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
              <select
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
                className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="">All Employees</option>
                {employees?.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={filters.displayStartDate || ''}
                  onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                  className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => startPickerRef.current?.showPicker()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
                <input
                  ref={startPickerRef}
                  type="date"
                  className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                  onChange={(e) => handleDateFilterChange('startDate', format(new Date(e.target.value), 'dd/MM/yyyy'))}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={filters.displayEndDate || ''}
                  onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                  className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => endPickerRef.current?.showPicker()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
                <input
                  ref={endPickerRef}
                  type="date"
                  className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                  onChange={(e) => handleDateFilterChange('endDate', format(new Date(e.target.value), 'dd/MM/yyyy'))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        </div>
      )}

      {data.length === 0 ? (
        <EmptyState title="No records" description="No attendance records found for the selected criteria." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Date</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Employee</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Status</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Punch In</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Break Time</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Punch Out</th>
                  <th className="text-left font-medium text-gray-500 px-6 py-4">Late Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.map((entry) => (
                  <tr key={entry.user._id + (entry.date || '')} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-700 whitespace-nowrap">
                      {entry.date ? formatAppDate(entry.date) : '—'}
                    </td>
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
