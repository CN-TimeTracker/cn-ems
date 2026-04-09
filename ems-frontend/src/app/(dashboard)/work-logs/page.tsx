'use client';

import { useState } from 'react';
import { useMyLogs, useAllLogs, useTodayHours, useCreateLog } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole } from '@/types';
import { Clock, Plus } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import LogForm from '@/components/logs/LogForm';
import LogHistory from '@/components/logs/LogHistory';

export default function WorkLogsPage() {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = user?.role === UserRole.Admin;
  const [showForm, setShowForm] = useState(false);
  const [adminFilters, setAdminFilters] = useState<{ userId?: string; projectId?: string }>({});

  const { data: todayData } = useTodayHours();
  const { data: myLogs, isLoading: myLogsLoading } = useMyLogs();
  const { data: allLogs, isLoading: allLogsLoading } = useAllLogs(isAdmin ? adminFilters : undefined);

  const isLoading = isAdmin ? allLogsLoading : myLogsLoading;
  const logs = isAdmin ? allLogs : myLogs;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Work Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? 'All employee work logs' : 'Your personal work log history'}
          </p>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Log Work
          </button>
        )}
      </div>

      {/* Today's hours card — employee only */}
      {!isAdmin && todayData && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Logged today</p>
              <p className="text-2xl font-semibold text-gray-900">{todayData.hours}h</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Remaining today</p>
              <p className="text-2xl font-semibold text-gray-900">{todayData.remaining}h</p>
            </div>
          </div>
        </div>
      )}

      {/* Log form modal */}
      {showForm && (
        <LogForm onClose={() => setShowForm(false)} />
      )}

      {/* Log history */}
      {isLoading
        ? <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        : <LogHistory logs={logs ?? []} isAdmin={isAdmin} />
      }
    </div>
  );
}