'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useApplyLeave } from '@/hooks';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Loader2, Calendar as CalendarIcon, Info, AlertCircle } from 'lucide-react';
import { formatAppDate, parseAppDate } from '@/lib/dateUtils';
import { format, isSameDay, addDays, startOfDay } from 'date-fns';
import { LeaveType, LeaveDuration, HalfDayType } from '@/types';
import { Holiday } from '@/types/holiday';

interface Props { 
  onClose: () => void; 
  initialDate?: Date;
  holidays: Holiday[];
}

export default function LeaveForm({ onClose, initialDate, holidays }: Props) {
  const defaultDate = initialDate ? format(initialDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
  
  const [form, setForm] = useState({ 
    startDate: defaultDate, 
    endDate: defaultDate, 
    displayStartDate: formatAppDate(initialDate || new Date()),
    displayEndDate: formatAppDate(initialDate || new Date()),
    reason: '',
    leaveType: LeaveType.Casual,
    duration: LeaveDuration.FullDay,
    halfDayType: HalfDayType.FirstHalf
  });

  const [dateError, setDateError] = useState<string | null>(null);
  const { mutate: applyLeave, isPending } = useApplyLeave();
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  // Compute boundaries
  const today = startOfDay(new Date());
  
  const minCasualDate = addDays(today, 5);
  const minDateStr = form.leaveType === LeaveType.Casual 
    ? format(minCasualDate, 'yyyy-MM-dd') 
    : format(today, 'yyyy-MM-dd');

  // Live Validation
  useEffect(() => {
    const start = new Date(form.startDate);
    const end = new Date(form.endDate);

    if (isNaN(start.getTime())) {
      setDateError(null);
      return;
    }

    // 1. Advance notice for Casual
    if (form.leaveType === LeaveType.Casual) {
      if (start < minCasualDate) {
        setDateError(`Casual leave requires at least 5 days of advance notice (Min date: ${format(minCasualDate, 'dd/MM/yyyy')})`);
        return;
      }
    }

    // 2. Holiday Check
    const holidayInRange = holidays.find(h => {
      const hDate = new Date(h.date);
      if (form.duration === LeaveDuration.HalfDay) {
        return isSameDay(hDate, start);
      }
      return hDate >= start && hDate <= end;
    });

    if (holidayInRange) {
      setDateError(`The selected range includes a Public Holiday: ${holidayInRange.name}`);
      return;
    }

    // 3. Simple sequence check
    if (form.duration === LeaveDuration.FullDay && end < start) {
      setDateError('End date cannot be before start date');
      return;
    }

    setDateError(null);
  }, [form.startDate, form.endDate, form.leaveType, form.duration, holidays, minCasualDate]);

  const set = (field: string, value: any) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      
      // Auto-correct if needed
      if (field === 'leaveType' || field === 'startDate') {
         const type = field === 'leaveType' ? value : next.leaveType;
         const min = type === LeaveType.Casual ? minCasualDate : today;
         const minStr = format(min, 'yyyy-MM-dd');
         
         if (next.startDate < minStr) {
           next.startDate = minStr;
           next.displayStartDate = format(min, 'dd/MM/yyyy');
         }
         if (next.endDate < next.startDate) {
           next.endDate = next.startDate;
           next.displayEndDate = next.displayStartDate;
         }
      }
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateError) return;

    const payload = {
      ...form,
      halfDayType: form.duration === LeaveDuration.HalfDay ? form.halfDayType : undefined,
      endDate: form.duration === LeaveDuration.HalfDay ? form.startDate : form.endDate
    };
    applyLeave(payload, { onSuccess: onClose });
  };

  const days = useMemo(() => {
    if (form.duration === LeaveDuration.HalfDay) return 0.5;
    if (!form.startDate || !form.endDate) return 0;
    return Math.max(1, Math.round((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1);
  }, [form.startDate, form.endDate, form.duration]);

  return (
    <Modal open onClose={onClose} title="Apply for Leave">
      <form onSubmit={handleSubmit} className="p-1 space-y-5 p-8">
        {/* Leave Type & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Type of Leave</label>
            <select 
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              value={form.leaveType}
              onChange={(e) => set('leaveType', e.target.value)}
              required
            >
              {Object.values(LeaveType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Duration</label>
            <select 
              className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none"
              value={form.duration}
              onChange={(e) => set('duration', e.target.value)}
              required
            >
              {Object.values(LeaveDuration).map(dur => <option key={dur} value={dur}>{dur}</option>)}
            </select>
          </div>
        </div>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <Input 
              label="From Date (DD/MM/YYYY)" 
              type="text" 
              required 
              placeholder="DD/MM/YYYY"
              value={form.displayStartDate} 
              onChange={(e) => {
                const val = e.target.value;
                set('displayStartDate', val);
                const parsed = parseAppDate(val);
                if (parsed) set('startDate', format(parsed, 'yyyy-MM-dd'));
              }} 
              className={`pr-10 ${dateError ? 'border-red-300 focus:ring-red-500' : ''}`}
            />
            <button
              type="button"
              onClick={() => startRef.current?.showPicker()}
              className="absolute right-2 top-8 p-1 text-gray-400 hover:text-brand-600 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <input
              ref={startRef}
              type="date"
              min={minDateStr}
              className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const d = new Date(val);
                setForm(f => ({
                  ...f,
                  startDate: val,
                  displayStartDate: format(d, 'dd/MM/yyyy')
                }));
              }}
            />
          </div>

          {form.duration === LeaveDuration.FullDay ? (
            <div className="relative">
              <Input 
                label="To Date (DD/MM/YYYY)" 
                type="text" 
                required 
                placeholder="DD/MM/YYYY"
                value={form.displayEndDate} 
                onChange={(e) => {
                  const val = e.target.value;
                  set('displayEndDate', val);
                  const parsed = parseAppDate(val);
                  if (parsed) set('endDate', format(parsed, 'yyyy-MM-dd'));
                }} 
                className={`pr-10 ${dateError ? 'border-red-300 focus:ring-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => endRef.current?.showPicker()}
                className="absolute right-2 top-8 p-1 text-gray-400 hover:text-brand-600 transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <input
                ref={endRef}
                type="date"
                min={form.startDate || minDateStr}
                className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const d = new Date(val);
                  setForm(f => ({
                    ...f,
                    endDate: val,
                    displayEndDate: format(d, 'dd/MM/yyyy')
                  }));
                }}
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Which Half?</label>
              <select 
                className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm focus:ring-2 focus:ring-brand-500 transition-all outline-none"
                value={form.halfDayType}
                onChange={(e) => set('halfDayType', e.target.value)}
                required
              >
                {Object.values(HalfDayType).map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Live Validation Error */}
        {dateError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{dateError}</span>
          </div>
        )}

        {/* Info Banner */}
        {!dateError && (
          <div className="rounded-2xl bg-brand-50/50 border border-brand-100 p-4 flex items-start gap-3">
            <div className="p-2 bg-brand-100 rounded-lg shrink-0">
              <Info className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-brand-900">Leave Summary</p>
              <p className="text-xs text-brand-700 mt-0.5">
                Applying for <span className="font-bold underline">{days} day{days !== 1 ? 's' : ''}</span> of {form.leaveType.toLowerCase()} leave.
                {form.leaveType === LeaveType.Casual && " Notice: Casual leave requires at least 5 days of advance notice."}
              </p>
            </div>
          </div>
        )}

        <Textarea 
          label="Reason for Leave" 
          required 
          placeholder="Briefly explain the reason for your leave request..."
          rows={3}
          value={form.reason} 
          onChange={(e) => set('reason', e.target.value)} 
        />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary h-12 flex-1 rounded-xl">Cancel</button>
          <button 
            type="submit" 
            disabled={isPending || !!dateError} 
            className={`btn-primary h-12 flex-1 justify-center rounded-xl shadow-lg transition-all ${
              (!!dateError) ? 'opacity-50 grayscale cursor-not-allowed shadow-none' : 'shadow-brand-200'
            }`}
          >
            {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Submit Request</span>}
          </button>
        </div>
      </form>
    </Modal>
  );
}
