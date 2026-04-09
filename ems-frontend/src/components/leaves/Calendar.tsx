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
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
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
    return leaves.filter(leave => {
      const start = parseISO(leave.startDate);
      const end = parseISO(leave.endDate);
      return isWithinInterval(day, { start, end });
    });
  };

  const getDayHoliday = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    return holidays.find(h => format(new Date(h.date), 'yyyy-MM-dd') === dateStr);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
  <div className="card flex flex-col p-0 overflow-hidden border-none shadow-xl bg-white/80 backdrop-blur-md mb-8">
  
    <div className="shrink-0 flex items-center justify-between p-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
          <CalendarIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            {formatAppDate(currentMonth)}
          </h2>
          <p className="text-xs text-brand-100 font-medium uppercase tracking-wider">
            Leave Scheduler
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-white/10 p-1 rounded-xl backdrop-blur-sm border border-white/10">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-white/20 rounded-lg transition-all active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="w-px h-4 bg-white/20" />
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-white/20 rounded-lg transition-all active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>

    {/* Day Names */}
    <div className="shrink-0 grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
      {dayNames.map(day => (
        <div
          key={day}
          className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-widest"
        >
          {day}
        </div>
      ))}
    </div>

    {/* Calendar Grid (50% height) */}
    <div className="grid grid-cols-7 flex-[0.5] overflow-auto">
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
              "group relative min-h-[80px] p-1.5 border-r border-b border-gray-50 transition-all hover:bg-brand-50/30 cursor-pointer",
              !isCurrentMonth && "bg-gray-50/30 text-gray-400",
              holiday && "bg-indigo-50/40 hover:bg-indigo-50/60",
              i % 7 === 6 && "border-r-0"
            )}
          >
            <div className="flex justify-between items-start mb-1">
              <span
                className={cn(
                  "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-colors",
                  isToday
                    ? "bg-brand-600 text-white shadow-md shadow-brand-200"
                    : "text-gray-700",
                  !isCurrentMonth && "text-gray-400"
                )}
              >
                {format(day, 'd')}
              </span>

              {isToday && (
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter">
                  Today
                </span>
              )}
            </div>

            <div className="space-y-1 overflow-hidden">
              {holiday && (
                <div className="text-[10px] px-1.5 py-1 rounded-md truncate font-bold bg-indigo-600 text-white shadow-sm border border-indigo-700">
                  🎉 {holiday.name}
                </div>
              )}
              {dayLeaves.map((leave, idx) => (
                <div
                  key={leave._id + idx}
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-md truncate font-medium border shadow-sm",
                    leave.status === LeaveStatus.Approved
                      ? "bg-green-50 text-green-700 border-green-100"
                      : leave.status === LeaveStatus.Pending
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  )}
                >
                  {leave.leaveType === 'Casual'
                    ? 'CL'
                    : leave.leaveType === 'Sick'
                    ? 'SL'
                    : 'EL'}{' '}
                  · {leave.userId.name}
                </div>
              ))}
            </div>

            {/* Hover effect */}
            <div className="absolute inset-0 bg-brand-600/0 group-hover:bg-brand-600/5 transition-colors pointer-events-none" />
          </div>
        );
      })}
    </div>

    {/* Legend */}
    <div className="shrink-0 p-4 bg-gray-50/50 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-center text-[10px] font-bold uppercase tracking-wider text-gray-500">
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm shadow-green-200" />
        Approved
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-200" />
        Pending
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200" />
        Rejected
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shadow-sm shadow-indigo-200" />
        Public Holiday
      </div>
    </div>
  </div>
)
}