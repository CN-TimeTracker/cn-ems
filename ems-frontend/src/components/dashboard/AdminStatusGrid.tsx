'use client';

import { 
  Users, 
  MapPin, 
  AlertCircle, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import { AdminDashboardData } from '@/types';
import Link from 'next/link';

interface AdminStatusGridProps {
  data: AdminDashboardData;
}

export default function AdminStatusGrid({ data }: AdminStatusGridProps) {
  const { totalUsersLogged, usersNotLoggedToday } = data;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* 1. ACTIVE WORKFORCE */}
      <PremiumCompactCard 
        icon={Activity}
        label="Workforce"
        title={`${totalUsersLogged} Active`}
        description="Punched in today"
        link="/attendance"
        gradient="from-emerald-500 to-teal-600"
        shadow="shadow-emerald-200"
      />

      {/* 2. ATTENDANCE ALERT */}
      <PremiumCompactCard 
        icon={AlertCircle}
        label="Attendance"
        title={`${usersNotLoggedToday.length} Pending`}
        description="Haven't logged yet"
        link="/leaves" 
        gradient="from-rose-500 to-red-600"
        shadow="shadow-rose-200"
      />

      {/* 3. PRODUCTIVITY */}
      <PremiumCompactCard 
        icon={TrendingUp}
        label="Utilization"
        title={data.totalHoursToday > 0 ? `${data.totalHoursToday.toFixed(0)}h` : 'No Activity'}
        description="Total hours logged"
        link="/projects"
        gradient="from-indigo-500 to-purple-600"
        shadow="shadow-indigo-200"
      />
    </div>
  );
}

function PremiumCompactCard({ 
  icon: Icon, 
  label, 
  title, 
  description, 
  link,
  gradient,
  shadow
}: { 
  icon: any, 
  label: string, 
  title: string, 
  description: string, 
  link: string,
  gradient: string,
  shadow: string
}) {
  return (
    <Link href={link} className="block group">
      <div className={`relative bg-gradient-to-br ${gradient} rounded-2xl p-4 text-white shadow-lg ${shadow} transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl group-hover:brightness-110 overflow-hidden`}>
        {/* Decorative Blur Circle */}
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
        
        <div className="relative flex items-center gap-4">
          <div className="p-2.5 bg-white/20 rounded-xl shrink-0 backdrop-blur-md border border-white/20 shadow-inner">
            <Icon className="w-5 h-5 text-white" />
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[10px] font-black opacity-80 uppercase tracking-widest truncate">{label}</p>
              <div className="p-1 bg-white/10 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
            <h4 className="text-base font-black tracking-tight truncate leading-tight">{title}</h4>
            <p className="text-[11px] text-white/70 font-bold truncate tracking-wide">{description}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
