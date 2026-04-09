'use client';

import { useState, useEffect } from 'react';
import { useEmployeeDashboard, useUpdateLateReason } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { UserRole } from '@/types';
import { Loader2, AlertCircle, Clock } from 'lucide-react';

export default function LateReasonModal() {
  const { user } = useAppSelector((state) => state.auth);
  const { data: dashboardData, isLoading } = useEmployeeDashboard();
  const { mutate: updateReason, isPending } = useUpdateLateReason();
  
  const [reason, setReason] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Show if: 1. Non-admin user, 2. Dashboard loaded, 3. isLate is true, 4. No lateReason yet
  useEffect(() => {
    if (!isLoading && user?.role !== UserRole.Admin && dashboardData?.todayAttendance) {
      const { isLate, lateReason } = dashboardData.todayAttendance;
      if (isLate && !lateReason) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    }
  }, [user, dashboardData, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    
    updateReason(reason, {
      onSuccess: () => {
        setIsOpen(false);
        setReason('');
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-amber-900">Late Arrival Detected</h3>
            <p className="text-xs text-amber-700">Punch-in time: {new Date(dashboardData?.todayAttendance?.punchInTime || '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100 text-sm text-gray-600">
            <AlertCircle className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <p>
              Our office hours start at <b>10:00 AM</b>. Since you arrived after the <b>10:15 AM</b> grace period, please provide a reason for your late arrival.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="reason" className="label">Reason for being late</label>
            <textarea
              id="reason"
              required
              className="input min-h-[120px] py-3 resize-none focus:ring-amber-500 focus:border-amber-500"
              placeholder="E.g., Traffic delay, Personal emergency, Technical issues..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isPending || !reason.trim()}
              className="btn-primary w-full justify-center py-2.5 bg-amber-600 hover:bg-amber-700 border-none shadow-amber-200"
            >
              {isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
              ) : (
                'Submit Reason & Continue'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
