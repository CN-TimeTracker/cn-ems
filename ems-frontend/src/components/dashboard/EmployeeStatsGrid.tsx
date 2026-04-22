'use client';

import { FolderKanban, CheckSquare, Clock, CalendarClock, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDecimalHours } from '@/lib/dateUtils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

function SummaryStatCard({ label, value, subtext, icon: Icon, iconColor, bgColor }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col gap-4 group hover:shadow-premium transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={cn("p-2.5 rounded-2xl", bgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
      </div>
      
      <div>
        <p className="text-xs font-black text-[#8A92A6] uppercase tracking-widest mb-1">{label}</p>
        <div className="flex items-baseline gap-1">
          <h4 className="text-2xl font-black text-[#1A2B48] tracking-tight">{value}</h4>
          <span className="text-[10px] font-bold text-[#8A92A6] uppercase">{subtext}</span>
        </div>
      </div>
    </div>
  );
}

interface EmployeeStatsGridProps {
  stats: {
    totalProjects: number;
    tasksToday: number;
    hoursLogged: string | number;
    leavesPending: number;
  }
}

export default function EmployeeStatsGrid({ stats }: EmployeeStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryStatCard 
        label="My Projects"
        value={stats.totalProjects}
        subtext="Assignments"
        icon={FolderKanban}
        iconColor="text-[#2563EB]"
        bgColor="bg-[#EBF2FF]"
      />
      <SummaryStatCard 
        label="Tasks Today"
        value={stats.tasksToday}
        subtext="Pending"
        icon={CheckSquare}
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50"
      />
      <SummaryStatCard 
        label="Logged Hours"
        value={formatDecimalHours(stats.hoursLogged)}
        subtext="Today"
        icon={Clock}
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50"
      />
      <SummaryStatCard 
        label="Pending Leaves"
        value={stats.leavesPending}
        subtext="Requested"
        icon={CalendarClock}
        iconColor="text-rose-600"
        bgColor="bg-rose-50"
      />
    </div>
  );
}
