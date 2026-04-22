'use client';

import { useAdminDashboard, useAllProjects, useAllUsers } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { AlertCircle, User as UserIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import QuoteService from '@/services/quote.service';
import { Quote, ProjectStatus } from '@/types';

// New Core HR Components
import CoreStatsGrid from './CoreStatsGrid';
import QuickActionGrid from './QuickActionGrid';
import ComplianceSummary from './ComplianceSummary';
import DetailedProjectTable from './DetailedProjectTable';
import { HolidayList, ComplianceDocList } from './RightPanelLists';
import ProjectDetailsModal from '@/components/projects/ProjectDetailsModal';
import { Project } from '@/types';

export default function AdminDashboard() {
  const currentUser = useAppSelector(selectCurrentUser);
  const { data, isLoading, error } = useAdminDashboard();
  const { data: allUsers } = useAllUsers();
  const { data: allProjects } = useAllProjects();
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

  if (isLoading || !currentUser || !allUsers || !allProjects) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );

  if (error || !data) return (
    <EmptyState 
      title="Failed to load dashboard" 
      description="There was an error fetching the dashboard data."
      icon={AlertCircle}
    />
  );

  // Real data for Admin Dashboard
  const adminStats = {
    // Total Employees excluding Admins
    totalEmployees: allUsers.filter(u => u.role !== 'Admin').length,
    onLeave: data.usersNotLoggedToday.length,
    // Employees who logged tasks today
    loggedToday: data.totalUsersLogged,
    activeProjects: allProjects.filter(p => p.status === ProjectStatus.Active).length
  };

  const compliancePercent = Math.round((data.totalUsersLogged / (adminStats.totalEmployees || 1)) * 100);

  const projectBreakdownItems = (allProjects || []).slice(0, 3).map(p => ({
    projectId: p._id,
    name: p.name,
    clientName: p.clientName,
    category: p.category,
    allocatedHours: p.allocatedHours,
    workedHours: data.projectHours.find(ph => ph.project === p.name)?.totalHours || 0,
    deadline: p.deadline
  }));

  const handleProjectClick = (projectId: string) => {
    const project = allProjects.find(p => p._id === projectId);
    if (project) {
      setViewingProject(project);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto animate-in fade-in duration-700">
      
      {/* 1. Header Section */}
      <header className="flex items-center justify-between mb-8 px-1">
        <div>
          <h1 className="text-2xl font-black text-[#1A2B48] tracking-tight mb-2">Dashboard</h1>
          {quote && (
            <div className="bg-[#EBF2FF] border border-[#D1E0FF] rounded-xl px-4 py-2.5 inline-block shadow-sm">
               <span className="text-[9px] font-black text-[#1A2B48] uppercase tracking-widest mb-1 block opacity-70">Quote of the day</span>
               <p className="text-xs font-bold text-[#2563EB] pr-8">"{quote.text}"</p>
               <p className="text-[9px] font-black text-[#6B7280] uppercase tracking-widest mt-1 text-right">— {quote.author}</p>
            </div>
          )}
        </div>
      </header>

      {/* 2. Top Stats Grid */}
      <CoreStatsGrid stats={adminStats} />

      {/* 3. Main Content Grids */}
      <div className="grid grid-cols-12 gap-6">
        
        {/* Tracking Highlights (Left - col 4) */}
        <div className="col-span-12 lg:col-span-4 h-full">
          <ComplianceSummary 
            percentage={compliancePercent}
            policyUpdates={allProjects?.length || 0}
            complianceIssues={data.usersWithNoTasks.length}
          />
        </div>

        {/* Quick Actions (Center - col 5) */}
        <div className="col-span-12 lg:col-span-5 h-full">
          <QuickActionGrid isAdmin={true} />
        </div>

        {/* Holidays (Right - col 3) */}
        <div className="col-span-12 lg:col-span-3 h-full">
          <HolidayList />
        </div>

        {/* Active Projects (Left+Center - col 9) */}
        <div className="col-span-12 lg:col-span-9 h-full">
          <DetailedProjectTable 
            projects={projectBreakdownItems} 
            onProjectClick={handleProjectClick}
          />
        </div>

        {/* Support Resources (Right - col 3) */}
        <div className="col-span-12 lg:col-span-3 h-full">
          <ComplianceDocList />
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
