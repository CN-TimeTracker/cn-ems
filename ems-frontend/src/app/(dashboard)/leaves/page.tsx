'use client';

import { useState, useMemo } from 'react';
import { useLeaves, usePendingLeaves, useHolidays } from '@/hooks';
import HolidayManager from '@/components/leaves/HolidayManager';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole } from '@/types';
import { Plus, Clock } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import LeaveTable from '@/components/leaves/LeaveTable';
import LeaveForm from '@/components/leaves/LeaveForm';
import Calendar from '@/components/leaves/Calendar';
import { formatAppDate } from '@/lib/dateUtils';
import { isSameMonth } from 'date-fns';

export default function LeavesPage() {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = user?.role === UserRole.Admin;
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const { data: leaves, isLoading } = useLeaves();
  const { data: pendingLeaves } = usePendingLeaves();
  const { data: holidays, isLoading: isHolidaysLoading } = useHolidays();
  
  const currentMonthLeaves = useMemo(() => {
    if (!leaves) return [];
    const today = new Date();
    return leaves.filter(leave => isSameMonth(new Date(leave.startDate), today));
  }, [leaves]);

  const handleDateClick = (date: Date) => {
    if (isAdmin) return; // Admins don't apply for leave from calendar
    setSelectedDate(date);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedDate(undefined);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title text-3xl">Leave Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin ? 'Review and manage employee time-off requests' : 'Plan your time off and track request status'}
          </p>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary shadow-lg shadow-brand-200">
            <Plus className="w-4 h-4 mr-2" /> Apply for Leave
          </button>
        )}
      </div>

      {/* Pending approval banner — admin only */}
      {isAdmin && (pendingLeaves?.length ?? 0) > 0 && (
        <div className="mb-8 rounded-2xl bg-amber-50 border border-amber-100 p-5 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Clock className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-amber-900 font-bold">Pending Requests</p>
            <p className="text-sm text-amber-700">
              There are <span className="font-extrabold">{pendingLeaves?.length} leave requests</span> waiting for your review.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Calendar View */}
        <div className="w-full h-full min-h-[500px]">
          {isLoading || isHolidaysLoading
            ? <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-3xl border border-dashed border-gray-200"><Spinner size="lg" /></div>
            : <Calendar leaves={leaves ?? []} holidays={holidays ?? []} onDateClick={handleDateClick} />
          }
        </div>

        {/* Right Column: Table Section & Form */}
        <div className="w-full flex flex-col gap-8 overflow-hidden lg:col-span-2">
        
          {/* Apply leave form */}
          {showForm && <LeaveForm onClose={handleCloseForm} initialDate={selectedDate} />}

          {/* Holiday Manager for Admins */}
          {isAdmin && <HolidayManager />}

          {/* Table Section */}
          {!isLoading && currentMonthLeaves.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 ml-1">Recent Requests</h2>
              <div className="overflow-x-auto pb-4">
                <LeaveTable leaves={currentMonthLeaves} isAdmin={isAdmin} />
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center py-20">
              <Spinner size="lg" />
            </div>
          )}

          {/* Public Holiday List Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 ml-1">Public Holidays</h2>
            {isHolidaysLoading ? (
              <div className="flex justify-center py-10"><Spinner size="sm" /></div>
            ) : holidays?.length === 0 ? (
              <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No public holidays scheduled
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {holidays?.map((holiday) => (
                  <div 
                    key={holiday._id}
                    className="flex items-center gap-4 p-4 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="w-16 h-12 rounded-2xl bg-brand-50 flex flex-col items-center justify-center border border-brand-100 shrink-0">
                      <span className="text-[10px] font-black text-brand-900 leading-none">
                        {formatAppDate(holiday.date)}
                      </span>
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-black text-gray-900 truncate">{holiday.name}</h3>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">
                        Public Holiday
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
