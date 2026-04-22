'use client';

import { 
  ArrowRight,
  Sun,
  Trophy,
  Activity
} from 'lucide-react';
import { EmployeeDashboardData } from '@/types';
import { formatAppDate } from '@/lib/dateUtils';
import Link from 'next/link';

interface DashboardStatusGridProps {
  data: EmployeeDashboardData;
}

export default function DashboardStatusGrid({ data }: DashboardStatusGridProps) {
  const { todayAttendance, upcomingHolidays, salaryStatus } = data;
  const nextHoliday = upcomingHolidays?.[0];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      {/* 1. ATTENDANCE */}
      <PremiumCompactCard 
        icon={Activity}
        label="Attendance"
        title={todayAttendance ? 'Punched In' : 'Shift Pending'}
        description={todayAttendance ? `Since ${formatTimeIST(todayAttendance.punchInTime)}` : 'Awaiting punch-in'}
        link="/attendance"
        gradient="from-emerald-500 to-teal-600"
        shadow="shadow-emerald-200"
      />

      {/* 2. HOLIDAY */}
      <PremiumCompactCard 
        icon={Sun}
        label="Next Off"
        title={nextHoliday ? nextHoliday.name : 'Work Mode'}
        description={nextHoliday ? formatAppDate(nextHoliday.date) : 'No holidays near'}
        link="/leaves" 
        gradient="from-indigo-500 to-purple-600"
        shadow="shadow-indigo-200"
      />

      {/* 3. SALARY */}
      <PremiumCompactCard 
        icon={Trophy}
        label={`${salaryStatus?.month || 'Salary'}`}
        title={salaryStatus?.status || 'Processing'}
        description={salaryStatus?.status === 'Verified' ? 'Ready' : 'Pending'}
        link="/salary"
        gradient="from-sky-500 to-blue-600"
        shadow="shadow-sky-200"
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

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function formatTimeIST(date: string | null): string {
  if (!date) return '—';
  const utcMs = new Date(date).getTime();
  const istMs = utcMs + IST_OFFSET_MS;
  const ist   = new Date(istMs);
  const h24   = ist.getUTCHours();
  const ampm  = h24 >= 12 ? 'PM' : 'AM';
  const h12   = h24 % 12 === 0 ? 12 : h24 % 12;
  const mm    = String(ist.getUTCMinutes()).padStart(2, '0');
  return `${String(h12).padStart(2, '0')}:${mm} ${ampm}`;
}
