'use client';

import { useEmployeeDashboard } from '@/hooks';
import DashboardProfileHeader from './DashboardProfileHeader';
import DetailedProjectTable from './DetailedProjectTable';
import { 
  ClipboardList, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { formatAppDate } from '@/lib/dateUtils';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';

export default function EmployeeDashboard() {
  const { data, isLoading, error } = useEmployeeDashboard();
  const currentUser = useAppSelector(selectCurrentUser);

  const formatHours = (decimalHours: number) => {
    const totalSeconds = Math.round(decimalHours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    
    return parts.join(' ');
  };

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );

  if (error || !data || !currentUser) return (
    <EmptyState 
      title="Failed to load dashboard" 
      description="There was an error fetching your dashboard data. Please try again."
      icon={AlertCircle}
    />
  );

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Profile Header Block */}
      <DashboardProfileHeader 
        user={currentUser} 
        stats={{
          totalProjects: data.totalProjects,
          todayTasks: data.todaysTasks.length,
          totalLeaves: data.totalLeaves
        }}
      />


      {/* Detailed Project Status (The centerpiece) */}
      <DetailedProjectTable projects={data.projectBreakdown} />

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Priority Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest text-sm">
                <CheckCircle2 className="w-4 h-4 text-brand-600" />
                Today's Task
              </h3>
              <Link href="/tasks" className="text-[10px] font-black text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors uppercase tracking-widest">
                View All <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {data.todaysTasks.length > 0 ? (
                data.todaysTasks.map((task) => (
                  <div key={task._id} className="px-8 py-6 hover:bg-brand-50/20 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">
                          {task.workType}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-[0.2em] font-black">
                          {(task.projectId as any)?.name}
                        </p>
                      </div>
                      <Badge variant="info">
                        {task.status}
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-sm text-gray-500 line-clamp-2 mt-2 leading-relaxed italic">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        Logged on: {formatAppDate(task.date)} {task.time ? `at ${task.time}` : ''}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-8 py-16 text-center">
                  <ClipboardList className="w-10 h-10 text-gray-100 mx-auto mb-4" />
                  <p className="text-gray-400 italic text-sm">No priority tasks for today.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Work Logs */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden h-fit">
          <div className="px-8 py-5 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 uppercase tracking-widest text-sm">
              <Clock className="w-4 h-4 text-brand-600" />
              Recent Tasks
            </h3>
            <Link href="/tasks" className="text-[10px] font-black text-brand-600 hover:text-brand-700 flex items-center gap-1 transition-colors uppercase tracking-widest">
              Add Task <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentLogs.length > 0 ? (
              data.recentLogs.map((log) => (
                <div key={log._id} className="px-6 py-5 hover:bg-brand-50/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 bg-brand-100 text-brand-700 rounded text-[10px] font-medium tracking-tighter uppercase whitespace-nowrap">
                      {formatHours(log.hours)}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{formatAppDate(log.date)}</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate">{(log.taskId as any)?.title}</p>
                  <p className="text-[10px] text-gray-400 mt-1 truncate uppercase tracking-widest">{(log.projectId as any)?.name}</p>
                </div>
              ))
            ) : (
              <div className="px-8 py-16 text-center text-gray-400 italic text-sm">
                No recent activity logs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
