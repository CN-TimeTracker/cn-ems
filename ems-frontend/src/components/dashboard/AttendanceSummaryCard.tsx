'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Clock, AlertTriangle, CheckCircle2, UserX, Loader2 } from 'lucide-react';
import * as AttendanceService from '@/services/attendance.service';
import { AdminAttendanceEntry } from '@/types';
import Badge from '@/components/ui/Badge';

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

function formatShortIST(date: string | null): string {
  if (!date) return '—';
  const utcMs = new Date(date).getTime();
  const istMs = utcMs + IST_OFFSET_MS;
  const ist   = new Date(istMs);
  const h24   = ist.getUTCHours();
  const ampm  = h24 >= 12 ? 'PM' : 'AM';
  const h12   = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm    = String(ist.getUTCMinutes()).padStart(2, '0');
  return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
}

// ─────────────────────────────────────────────
// ROW COMPONENT
// ─────────────────────────────────────────────

function AttendanceRow({ entry }: { entry: AdminAttendanceEntry }) {
  const initials = entry.user.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="px-4 py-2 flex items-center gap-3 hover:bg-gray-50/50 transition-colors group">
      {/* Mini Avatar */}
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-all group-hover:scale-105 ${
          !entry.hasPunchedIn
            ? 'bg-gray-100 text-gray-400'
            : entry.isLate
            ? 'bg-amber-100 text-amber-700 shadow-sm shadow-amber-100'
            : 'bg-emerald-100 text-emerald-700 shadow-sm shadow-emerald-100'
        }`}
      >
        {initials}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-gray-900 truncate leading-tight">{entry.user.name}</p>
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tight leading-none">{entry.user.role}</p>
      </div>

      {/* Status & Time */}
      <div className="text-right flex-shrink-0 flex items-center gap-3">
        <div className="text-right">
          <p className={`text-[10px] font-black tracking-tighter ${
              !entry.hasPunchedIn ? 'text-gray-300' : entry.isLate ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            {formatShortIST(entry.punchInTime)}
          </p>
        </div>

        {/* Status Mini Icons */}
        {!entry.hasPunchedIn ? (
          <div className="p-1 px-1.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100" title="Not Checked In">
            <UserX className="w-3 h-3" />
          </div>
        ) : entry.isLate ? (
          <div className="p-1 px-1.5 bg-amber-50 text-amber-600 rounded-md border border-amber-100" title="Late Check-in">
            <AlertTriangle className="w-3 h-3" />
          </div>
        ) : (
          <div className="p-1 px-1.5 bg-emerald-50 text-emerald-500 rounded-md border border-emerald-100" title="On Time">
            <CheckCircle2 className="w-3 h-3" />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────

export default function AttendanceSummaryCard() {
  const { data, isLoading } = useQuery({
    queryKey:  ['attendance', 'admin', 'today'],
    queryFn:   AttendanceService.getAdminTodayView,
    staleTime: 60_000,
    refetchInterval: 2 * 60 * 1000, // auto-refresh every 2 min
  });

  const checkedIn   = data?.filter((e) => e.hasPunchedIn)  ?? [];
  const notCheckedIn = data?.filter((e) => !e.hasPunchedIn) ?? [];
  const lateCount   = checkedIn.filter((e) => e.isLate).length;

  const sorted: AdminAttendanceEntry[] = [
    ...(data?.filter((e) => e.hasPunchedIn && !e.isLate)  ?? []),
    ...(data?.filter((e) => e.hasPunchedIn && e.isLate)   ?? []),
    ...(data?.filter((e) => !e.hasPunchedIn)               ?? []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Premium Compact Header */}
      <div className="px-4 py-2 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-tight text-[11px]">
          <Clock className="w-3.5 h-3.5 text-brand-600" />
          Today's Attendance
        </h3>
        <div className="flex items-center gap-1.5">
          <Badge variant="success" className="scale-75 origin-right">{checkedIn.length - lateCount} On Time</Badge>
          {lateCount > 0 && <Badge variant="warning" className="scale-75 origin-right">{lateCount} Late</Badge>}
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-brand-400" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-10 text-center text-gray-400 text-[10px] italic">No records.</div>
      ) : (
        <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
          {sorted.slice(0, 10).map((entry) => (
            <AttendanceRow key={entry.user._id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
