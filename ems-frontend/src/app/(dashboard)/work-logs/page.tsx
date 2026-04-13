'use client';

import { useState, useRef } from 'react';
import { 
  useMyLogs, 
  useAllLogs, 
  useTodayHours, 
  useActiveProjects, 
  useActiveEmployees 
} from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole } from '@/types';
import { Clock, Plus, Filter, Calendar as CalendarIcon, RefreshCcw } from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '@/components/ui/Spinner';
import LogForm from '@/components/logs/LogForm';
import LogHistory from '@/components/logs/LogHistory';

export default function WorkLogsPage() {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = user?.role === UserRole.Admin;
  const [showForm, setShowForm] = useState(false);
  
  // Filters State
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const startPickerRef = useRef<HTMLInputElement>(null);
  const endPickerRef = useRef<HTMLInputElement>(null);

  const { data: projects } = useActiveProjects();
  const { data: employees } = useActiveEmployees();

  const { data: todayData } = useTodayHours();
  const { data: myLogs, isLoading: myLogsLoading } = useMyLogs(filters);
  const { data: allLogs, isLoading: allLogsLoading } = useAllLogs(isAdmin ? filters : undefined);

  const isLoading = isAdmin ? allLogsLoading : myLogsLoading;
  const logs = isAdmin ? allLogs : myLogs;

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
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          {!isAdmin && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="w-4 h-4" /> Log Work
            </button>
          )}
        </div>
      </div>

      {/* FILTERS BAR */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Project Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
              <select
                value={filters.projectId || ''}
                onChange={(e) => handleFilterChange('projectId', e.target.value)}
                className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To Filter (Admin Only) */}
            {isAdmin && (
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
            )}

            {/* Start Date */}
            <div className="flex-1 min-w-[200px]">
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
            <div className="flex-1 min-w-[200px]">
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