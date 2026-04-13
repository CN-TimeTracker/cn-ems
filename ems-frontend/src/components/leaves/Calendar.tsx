'use client';

import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  eachDayOfInterval,
  isWithinInterval,
  parseISO,
  startOfDay
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2, AlertCircle, Clock, XCircle } from 'lucide-react';
import { Leave, LeaveStatus } from '@/types';
import { Holiday } from '@/types/holiday';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { formatAppDate } from '@/lib/dateUtils';

interface Props {
  leaves: Leave[];
  holidays: Holiday[];
  onDateClick: (date: Date) => void;
}

export default function Calendar({ leaves, holidays, onDateClick }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getDayLeaves = (day: Date) => {
    const d = startOfDay(day);
    return leaves.filter(leave => {
      // Normalize to start of day for comparison
      const start = startOfDay(new Date(leave.startDate));
      const end = startOfDay(new Date(leave.endDate));
      return isWithinInterval(d, { start, end });
    });
  };

  const getDayHoliday = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return holidays.find(h => format(new Date(h.date), 'yyyy-MM-dd') === dateStr);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
  <div className="card flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-white/90 backdrop-blur-lg mb-8">
  
    <div className="shrink-0 flex items-center justify-between p-5 bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div className="flex items-center gap-4">
        <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner">
          <CalendarIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <p className="text-[10px] text-brand-100 font-bold uppercase tracking-[0.2em] opacity-80">
            Leave Planner & Tracker
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-black/10 p-1.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-lg">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/20 rounded-xl transition-all active:scale-90"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Day Names */}
    <div className="shrink-0 grid grid-cols-7 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
      {dayNames.map(day => (
        <div
          key={day}
          className="py-4 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]"
        >
          {day}
        </div>
      ))}
    </div>

    {/* Calendar Grid */}
    <div className="grid grid-cols-7 border-l border-t border-gray-100/50">
      {calendarDays.map((day, i) => {
        const dayLeaves = getDayLeaves(day);
        const holiday = getDayHoliday(day);
        const isToday = isSameDay(day, new Date());
        const isCurrentMonth = isSameMonth(day, monthStart);

        return (
          <div
            key={day.toString()}
            onClick={() => !holiday && onDateClick(day)}
            className={cn(
              "group relative min-h-[110px] p-2 border-r border-b border-gray-100 transition-all cursor-pointer",
              !isCurrentMonth ? "bg-gray-50/40 text-gray-300" : "bg-white",
              holiday && "bg-brand-50/30",
              "hover:z-10 hover:shadow-2xl hover:bg-white hover:scale-[1.02] transform-gpu"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span
                className={cn(
                  "text-xs font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all",
                  isToday
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-200 ring-2 ring-white"
                    : "text-gray-900",
                  !isCurrentMonth && "text-gray-300"
                )}
              >
                {format(day, 'd')}
              </span>

              {isToday && (
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse mt-3" />
              )}
            </div>

            <div className="space-y-1.5 overflow-hidden">
              {holiday && (
                <div className="text-[9px] px-2 py-1 rounded-lg truncate font-black bg-brand-600 text-white shadow-sm border border-brand-700 animate-in fade-in zoom-in-95">
                  ✨ {holiday.name}
                </div>
              )}
              {dayLeaves.map((leave, idx) => (
                <div
                  key={leave._id + idx}
                  className={cn(
                    "text-[9px] px-2 py-1 rounded-lg truncate font-bold border flex items-center gap-1.5 shadow-sm transition-transform hover:scale-105",
                    leave.status === LeaveStatus.Approved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : leave.status === LeaveStatus.Pending
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-rose-50 text-rose-700 border-rose-100"
                  )}
                >
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    leave.status === LeaveStatus.Approved ? "bg-emerald-500" : 
                    leave.status === LeaveStatus.Pending ? "bg-amber-500" : "bg-rose-500"
                  )} />
                  {leave.leaveType === 'Casual' ? 'CL' : leave.leaveType === 'Sick' ? 'SL' : 'EL'}{' '}
                  · {leave.userId.name.split(' ')[0]}
                </div>
              ))}
            </div>

            {/* Subtle Cell Accent */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-transparent to-gray-50/50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        );
      })}
    </div>

    {/* Pro Legend */}
    <div className="shrink-0 p-5 bg-gray-50/80 backdrop-blur-sm border-t border-gray-100 flex flex-wrap gap-6 items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-500">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        Approved
      </div>
      <div className="flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        Pending
      </div>
      <div className="flex items-center gap-2">
        <XCircle className="w-3.5 h-3.5 text-rose-500" />
        Rejected
      </div>
      <div className="flex items-center gap-2">
        <div className="w-3.5 h-3.5 rounded-lg bg-brand-600 shadow-sm" />
        Public Holiday
      </div>
    </div>
  </div>
)
}