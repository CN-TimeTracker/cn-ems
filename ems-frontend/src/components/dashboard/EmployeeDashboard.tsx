'use client';

import { useEmployeeDashboard } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { AlertCircle, History, BookOpen, Clock, Layers, CheckSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDecimalHours } from '@/lib/dateUtils';
import QuoteService from '@/services/quote.service';
import { Quote } from '@/types';

// New Core HR Components (reused)
import EmployeeStatsGrid from './EmployeeStatsGrid';
import QuickActionGrid from './QuickActionGrid';
import EngagementBarChart from './EngagementBarChart';
import { HolidayList } from './RightPanelLists';
import DetailedProjectTable from './DetailedProjectTable';
import ProjectDetailsModal from '@/components/projects/ProjectDetailsModal';
import { Project } from '@/types';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { useAssignedProjects } from '@/hooks';

export default function EmployeeDashboard() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data, isLoading, error } = useEmployeeDashboard();
  const { data: assignedProjects } = useAssignedProjects();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const q = await QuoteService.getDailyQuote();
        setQuote(q);
      } catch (err) {
        console.error('Failed to fetch quote', err);
      }
    };
    fetchQuote();
  }, []);

  if (isLoading || !currentUser) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );

  if (error || !data) return (
    <EmptyState 
      title="Failed to load dashboard" 
      description="There was an error fetching your employee dashboard."
      icon={AlertCircle}
    />
  );

  // Map real employee data
  const employeeStats = {
    totalProjects: data.totalProjects,
    tasksToday: data.todaysTasks.length,
    hoursLogged: data.todaysLoggedHours.toFixed(1),
    leavesPending: data.totalLeaves
  };

  const handleProjectClick = (projectId: string) => {
    const project = assignedProjects?.find(p => p._id === projectId);
    if (project) {
      setViewingProject(project);
    }
  };

  // Prepare personal productivity data for the bar chart
  // Group recent logs by date to show a trend
  const last4Days = Array.from({ length: 4 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (3 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayHours = data.recentLogs
      .filter(log => log.startTime && log.startTime.startsWith(dStr))
      .reduce((sum, log) => sum + log.hours, 0);
    
    return {
      name: i.toString(),
      value: Number(dayHours.toFixed(1)), // Actual hours logged
      label: d.toLocaleDateString([], { weekday: 'short' })
    };
  });

  const dailyAverage = last4Days.length > 0 
    ? (last4Days.reduce((a, b) => a + b.value, 0) / last4Days.length).toFixed(1)
    : "0.0";

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* 1. Header Section */}
      <header className="flex items-center justify-between mb-8 px-1">
        <div>
          <h1 className="text-2xl font-black text-[#1A2B48] tracking-tight mb-2">Welcome, {currentUser.name.split(' ')[0]}</h1>
          {quote ? (
            <div className="bg-[#EBF2FF] border border-[#D1E0FF] rounded-xl px-4 py-2.5 inline-block shadow-sm">
               <span className="text-[9px] font-black text-[#1A2B48] uppercase tracking-widest mb-1 block opacity-70">Quote of the day</span>
               <p className="text-xs font-bold text-[#2563EB] pr-8">"{quote.text}"</p>
               <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mt-1 text-right">— {quote.author}</p>
            </div>
          ) : (
            <p className="text-[10px] font-black text-[#8A92A6] uppercase tracking-[0.2em] mt-1">Here is what's happening today</p>
          )}
        </div>
      </header>

      {/* 2. Personalized Stats Grid */}
      <EmployeeStatsGrid stats={employeeStats} />

      {/* 3. Main Content Grids */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Priority Tasks (Left - col 4) */}
        <div className="col-span-12 lg:col-span-4 h-full">
            <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col h-full hover:shadow-premium transition-all duration-300">
              <h3 className="text-[11px] font-black text-[#1A2B48] uppercase tracking-widest mb-6 flex items-center gap-2">
                <CheckSquare className="w-3.5 h-3.5 text-brand-500" />
                Task Priority
              </h3>
              <div className="space-y-4">
                {data.todaysTasks.slice(0, 4).map((task) => (
                  <div key={task._id} className="flex items-center justify-between group cursor-pointer hover:bg-gray-50 p-2.5 -mx-1.5 rounded-2xl transition-all">
                    <div className="flex items-center gap-3">
                       <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                         <Layers className="w-4 h-4" />
                       </div>
                       <div>
                         <p className="text-[11px] font-black text-[#1A2B48] uppercase truncate max-w-[120px] leading-none mb-1">{task.workType}</p>
                         <p className="text-[9px] font-bold text-[#8A92A6] uppercase">{(task as any).projectId?.name || 'In Progress'}</p>
                       </div>
                    </div>
                    <Badge variant="info" className="scale-75 origin-right font-black">{task.status}</Badge>
                  </div>
                ))}
                {data.todaysTasks.length === 0 && (
                  <div className="py-12 text-center text-[10px] text-gray-400 font-bold uppercase italic">All tasks caught up!</div>
                )}
              </div>
              <div className="mt-auto pt-6 border-t border-gray-50">
                <Link href="/tasks" className="text-[10px] font-black text-[#2563EB] uppercase tracking-widest border-b-2 border-transparent hover:border-[#2563EB] transition-all pb-0.5">View Workspace</Link>
              </div>
            </div>
        </div>

        {/* Quick Actions (Center - col 5) */}
        <div className="col-span-12 lg:col-span-5 h-full">
          <QuickActionGrid isAdmin={false} />
        </div>

        {/* Holidays (Right - col 3) */}
        <div className="col-span-12 lg:col-span-3 h-full">
          <HolidayList />
        </div>

        {/* Active Projects (Left+Center - col 9) */}
        <div className="col-span-12 lg:col-span-9 h-full">
          <DetailedProjectTable 
            projects={data.projectBreakdown} 
            onProjectClick={handleProjectClick}
          />
        </div>

        {/* Recent Work Activity (Right - col 3) */}
        <div className="col-span-12 lg:col-span-3 h-full">
            <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col h-full hover:shadow-premium transition-all">
              <h3 className="text-[11px] font-black text-[#1A2B48] uppercase tracking-widest mb-6">Recent Activity</h3>
              <div className="space-y-5">
                {data.recentLogs.slice(0, 4).map((log) => (
                  <div key={log._id} className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-[#8A92A6]" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-[#1A2B48] uppercase truncate max-w-[100px]">{(log as any).taskId?.workType || (log as any).projectName || 'Task'}</p>
                          <p className="text-[9px] font-bold text-[#8A92A6] tabular-nums">{formatDecimalHours(log.hours)}</p>
                        </div>
                     </div>
                     <span className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter">
                        {log.startTime ? new Date(log.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Today'}
                     </span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6 border-t border-gray-50">
                <Link href="/work-logs" className="px-5 py-2 bg-[#F3F7FF] text-[#2563EB] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#EBF2FF] transition-colors inline-block w-full text-center">
                  Full History
                </Link>
              </div>
            </div>
        </div>

        {/* Personal Productivity (Previously in col 9) */}
        <div className="col-span-12 lg:col-span-12 h-full">
          <EngagementBarChart 
            title="Weekly Work Progress"
            subtitle="Total hours logged per day"
            data={last4Days}
            averageLabel="Daily Average"
            averageValue={formatDecimalHours(dailyAverage)}
          />
        </div>

      </div>

      {/* Viewing Project Detail */}
      <ProjectDetailsModal 
        open={!!viewingProject} 
        onClose={() => setViewingProject(null)} 
        project={viewingProject} 
      />
    </div>
  );
}
