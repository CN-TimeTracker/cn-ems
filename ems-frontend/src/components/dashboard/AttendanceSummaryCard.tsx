'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, Clock, AlertTriangle, CheckCircle2, UserX, Loader2 } from 'lucide-react';
import * as AttendanceService from '@/services/attendance.service';
import { AdminAttendanceEntry } from '@/types';

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
    <div className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
          !entry.hasPunchedIn
            ? 'bg-gray-100 text-gray-400'
            : entry.isLate
            ? 'bg-amber-100 text-amber-700'
            : 'bg-green-100 text-green-700'
        }`}
      >
        {initials}
      </div>

      {/* Name + role */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{entry.user.name}</p>
        <p className="text-xs text-gray-400 font-medium">{entry.user.role}</p>
        {entry.isLate && entry.lateReason && (
          <p className="text-xs text-amber-600 italic mt-0.5 truncate max-w-[260px]">
            "{entry.lateReason}"
          </p>
        )}
      </div>

      {/* Punch-in time */}
      <div className="text-right flex-shrink-0">
        <p
          className={`text-sm font-bold ${
            !entry.hasPunchedIn
              ? 'text-gray-300'
              : entry.isLate
              ? 'text-amber-600'
              : 'text-green-600'
          }`}
        >
          {formatShortIST(entry.punchInTime)}
        </p>

        {/* Status badge */}
        {!entry.hasPunchedIn ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full mt-1">
            <UserX className="w-2.5 h-2.5" /> Not checked in
          </span>
        ) : entry.isLate ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full mt-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Late
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full mt-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> On Time
          </span>
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

  // Sort: on time → late → not checked in
  const sorted: AdminAttendanceEntry[] = [
    ...(data?.filter((e) => e.hasPunchedIn && !e.isLate)  ?? []),
    ...(data?.filter((e) => e.hasPunchedIn && e.isLate)   ?? []),
    ...(data?.filter((e) => !e.hasPunchedIn)               ?? []),
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          Today's Attendance
        </h3>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {checkedIn.length - lateCount} On Time
          </span>
          {lateCount > 0 && (
            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {lateCount} Late
            </span>
          )}
          <span className="bg-red-100 text-red-600 px-2.5 py-1 rounded-full flex items-center gap-1">
            <UserX className="w-3 h-3" />
            {notCheckedIn.length} Absent
          </span>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm italic">
          <Users className="w-8 h-8 mx-auto mb-2 text-gray-200" />
          No employee records found for today.
        </div>
      ) : (
        <div className="divide-y divide-gray-50 max-h-[420px] overflow-y-auto">
          {sorted.map((entry) => (
            <AttendanceRow key={entry.user._id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
