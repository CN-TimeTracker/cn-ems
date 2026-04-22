'use client';

import { Users, CheckCircle, CalendarClock, AlertCircle, FolderKanban, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  alert?: boolean;
}

function SummaryStatCard({ label, value, subtext, icon: Icon, iconColor, bgColor, alert }: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col gap-4 group hover:shadow-premium transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className={cn("p-2.5 rounded-2xl", bgColor)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {alert && (
          <div className="w-5 h-5 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
          </div>
        )}
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

interface CoreStatsGridProps {
  stats: {
    totalEmployees: number;
    onLeave: number;
    loggedToday: number;
    activeProjects: number;
  }
}

export default function CoreStatsGrid({ stats }: CoreStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryStatCard 
        label="Total Employees"
        value={stats.totalEmployees}
        subtext="Employee"
        icon={Users}
        iconColor="text-[#2563EB]"
        bgColor="bg-[#EBF2FF]"
      />
      <SummaryStatCard 
        label="On Leave"
        value={stats.onLeave}
        subtext="Leaves"
        icon={CalendarClock}
        iconColor="text-emerald-600"
        bgColor="bg-emerald-50"
      />
      <SummaryStatCard 
        label="Logged Today"
        value={stats.loggedToday}
        subtext="Logged In"
        icon={CheckCircle}
        iconColor="text-indigo-600"
        bgColor="bg-indigo-50"
      />
      <SummaryStatCard 
        label="Active Projects"
        value={stats.activeProjects}
        subtext="Projects"
        icon={FolderKanban}
        iconColor="text-amber-600"
        bgColor="bg-amber-50"
      />
    </div>
  );
}
