'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, LogIn, CheckCircle2, AlertTriangle, Loader2, PauseCircle, PlayCircle, LogOut } from 'lucide-react';
import * as AttendanceService from '@/services/attendance.service';
import { useAppDispatch } from '@/store/hooks';
import { addToast } from '@/store/uiSlice';
import Badge from '@/components/ui/Badge';

// ─────────────────────────────────────────────
// CONSTANTS
// Office: 10:00 AM – 7:00 PM IST
// Grace period ends at 10:15 AM IST
// ─────────────────────────────────────────────
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const GRACE_H       = 10;
const GRACE_M       = 15;

/** Get current IST hours/minutes */
function getNowISTComponents() {
  const utcMs = Date.now();
  const istMs = utcMs + IST_OFFSET_MS;
  const ist   = new Date(istMs);
  return { h: ist.getUTCHours(), m: ist.getUTCMinutes(), s: ist.getUTCSeconds() };
}

function isLateNow() {
  const { h, m } = getNowISTComponents();
  return h > GRACE_H || (h === GRACE_H && m > GRACE_M);
}

function formatTimeIST(date: Date | string) {
  const utcMs = new Date(date).getTime();
  const istMs = utcMs + IST_OFFSET_MS;
  const ist   = new Date(istMs);
  const h24   = ist.getUTCHours();
  const ampm  = h24 >= 12 ? 'PM' : 'AM';
  const h12   = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm    = String(ist.getUTCMinutes()).padStart(2, '0');
  const ss    = String(ist.getUTCSeconds()).padStart(2, '0');
  return `${String(h12).padStart(2, '0')}:${mm}:${ss} ${ampm}`;
}

function currentTimeIST() {
  return formatTimeIST(new Date());
}

function formatDuration(ms: number) {
  if (ms < 0) ms = 0;
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────

export default function PunchInCard() {
  const dispatch      = useAppDispatch();
  const queryClient   = useQueryClient();
  const [nowStr, setNowStr] = useState<string>(currentTimeIST());
  const [nowMs, setNowMs] = useState<number>(Date.now());
  const [lateReason, setLateReason] = useState('');

  // Tick the clock every second for live timers
  useEffect(() => {
    const id = setInterval(() => {
      setNowStr(currentTimeIST());
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const { data: record, isLoading } = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn:  AttendanceService.getMyToday,
    staleTime: 60_000,
  });

  const late = isLateNow();

  // Mutations
  const punchInMut = useMutation({
    mutationFn: () => AttendanceService.punchIn({ lateReason: late ? lateReason : undefined }),
    onSuccess: (rec) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      dispatch(addToast({
        type: rec.isLate ? 'warning' : 'success',
        message: rec.isLate ? 'Punched in late. Reason recorded.' : 'Punched in successfully! Have a great day 👋',
      }));
    },
    onError: (err: Error) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const startBreakMut = useMutation({
    mutationFn: () => AttendanceService.startBreak(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
    onError: (err: Error) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const endBreakMut = useMutation({
    mutationFn: () => AttendanceService.endBreak(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attendance'] }),
    onError: (err: Error) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const punchOutMut = useMutation({
    mutationFn: () => AttendanceService.punchOut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      dispatch(addToast({ type: 'success', message: 'You have punched out. Great work today!' }));
    },
    onError: (err: Error) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const handlePunchIn = useCallback(() => {
    if (late && !lateReason.trim()) {
      dispatch(addToast({ type: 'error', message: 'Please enter a reason for being late.' }));
      return;
    }
    punchInMut.mutate();
  }, [late, lateReason, punchInMut, dispatch]);

  const anyMutPending = punchInMut.isPending || startBreakMut.isPending || endBreakMut.isPending || punchOutMut.isPending;

  // ── 1. FINISHED (Punched Out) ────────────────────────
  if (record?.punchOutTime) {
    let totalBreaksMs = 0;
    const breaks = record.breaks || [];
    breaks.forEach((b: any) => {
      if (b.endTime) totalBreaksMs += new Date(b.endTime).getTime() - new Date(b.startTime).getTime();
    });
    
    const totalClockMs = new Date(record.punchOutTime).getTime() - new Date(record.punchInTime).getTime();
    const netWorkMs = totalClockMs - totalBreaksMs;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Shift Ended</h3>
          </div>
          <Badge variant="default" className="text-gray-500 bg-gray-100 border-gray-200">Finished</Badge>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center gap-8 text-center p-6 bg-gray-50 rounded-xl border border-gray-100">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total Clock Hours</p>
              <p className="text-2xl font-bold text-gray-900">{formatDuration(totalClockMs)}</p>
            </div>
            <div className="w-px h-12 bg-gray-200" />
            <div>
              <p className="text-xs text-brand-600 uppercase tracking-wider font-semibold mb-1">Net Work Hours</p>
              <p className="text-2xl font-bold text-brand-600">{formatDuration(netWorkMs)}</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-400 mt-4">
            You punched out at {formatTimeIST(record.punchOutTime)}. See you tomorrow!
          </p>
        </div>
      </div>
    );
  }

  // ── 2. ACTIVE (Punched In) ────────────────────────
  if (record) {
    // Calculate live data
    let totalBreaksMs = 0;
    let isOnBreak = false;
    const breaks = record.breaks || [];

    breaks.forEach((b: any) => {
      const start = new Date(b.startTime).getTime();
      const end = b.endTime ? new Date(b.endTime).getTime() : nowMs;
      totalBreaksMs += (end - start);
      if (!b.endTime) isOnBreak = true;
    });

    const totalClockMs = nowMs - new Date(record.punchInTime).getTime();
    const netWorkMs = totalClockMs - totalBreaksMs;

    return (
      <div className="bg-white rounded-2xl border border-brand-200 shadow-sm overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-brand-100 bg-brand-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-brand-500 fill-brand-50" />
            <h3 className="font-semibold text-gray-900">Shift Active</h3>
          </div>
          <p className="text-sm font-bold tabular-nums tracking-tight bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
            {formatDuration(netWorkMs)}
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Punched In</p>
                <p className="font-bold text-gray-900 mt-0.5">{formatTimeIST(record.punchInTime)}</p>
              </div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${record.isLate ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 font-medium">Away Time</p>
                <p className="font-bold text-gray-900 mt-0.5 tabular-nums">{formatDuration(totalBreaksMs)}</p>
              </div>
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-200 text-gray-500">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>
          
          <p className="text-[10px] text-gray-400 mt-4 italic text-center">
            Shift auto-pauses on logout and resumes on login. No manual punch-out required.
          </p>
        </div>
      </div>
    );
  }

  // ── 3. NOT PUNCHED IN YET ────────────────────────
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${late ? 'border-amber-200' : 'border-gray-100'}`}>
      <div className={`px-6 py-4 border-b flex items-center justify-between ${late ? 'bg-amber-50/60 border-amber-100' : 'bg-gray-50/50 border-gray-100'}`}>
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${late ? 'text-amber-500' : 'text-brand-600'}`} />
          <h3 className="font-semibold text-gray-900">Punch In</h3>
        </div>
        {late && (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2.5 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" /> You are late
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Current Time (IST)</p>
            <p className="text-3xl font-bold tabular-nums text-gray-900">{isLoading ? '—' : nowStr}</p>
            <p className="text-xs text-gray-400 mt-1">Office hours: 10:00 AM – 7:00 PM · Grace: 15 min</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${late ? 'bg-amber-50' : 'bg-brand-50'}`}>
            <Clock className={`w-7 h-7 ${late ? 'text-amber-400' : 'text-brand-400'}`} />
          </div>
        </div>

        {late && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
            <label className="text-xs font-semibold text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Reason for arriving late <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={lateReason}
              onChange={(e) => setLateReason(e.target.value)}
              placeholder="Please explain why you are late today…"
              className="w-full text-sm px-3 py-2 rounded-lg border border-amber-300 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
              maxLength={500}
            />
            <p className="text-[10px] text-gray-400 text-right">{lateReason.length}/500</p>
          </div>
        )}

        <button
          onClick={handlePunchIn}
          disabled={anyMutPending || isLoading}
          className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-white text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60
            ${late ? 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-400' : 'bg-brand-600 hover:bg-brand-700 focus:ring-brand-500'}`}
        >
          {punchInMut.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Punching In…</> : <><LogIn className="w-4 h-4" /> Punch In Now</>}
        </button>
      </div>
    </div>
  );
}
