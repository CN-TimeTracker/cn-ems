'use client';

import Link from 'next/link';

import { User } from '@/types';
import { 
  Mail, 
  Phone, 
  Calendar, 
  User as UserIcon,
  Layers,
  ClipboardCheck,
  CalendarDays
} from 'lucide-react';
import { formatAppDate } from '@/lib/dateUtils';
import Image from 'next/image';

interface DashboardProfileHeaderProps {
  user: User;
  stats: {
    totalProjects: number;
    todayTasks: number;
    totalLeaves: number;
  };
}

export default function DashboardProfileHeader({ user, stats }: DashboardProfileHeaderProps) {
  const formattedDob = formatAppDate(user.dateOfBirth);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
        <div className="flex flex-col lg:flex-col h-full">
          {/* Left: Profile Info */}
          <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 border-b lg:border-b-0 lg:border-r border-gray-100 bg-gradient-to-br from-white to-gray-50/50">
            {/* Avatar Container */}
            <div className="relative group shrink-0">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-brand-50 border-4 border-white shadow-lg relative">
                {user.profilePicture ? (
                  <Image 
                    src={user.profilePicture} 
                    alt={user.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold text-5xl">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
            </div>

            {/* User Details */}
            <div className="flex-1 py-1">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                    {user.name}
                    <span className="text-sm font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest bg-white shadow-sm border border-gray-100">
                      {user.role}
                    </span>
                  </h1>
                </div>
                <div className="hidden md:flex items-center gap-2 bg-brand-50 text-brand-700 px-4 py-2 rounded-2xl border border-brand-100">
                  <UserIcon className="w-4 h-4" />
                  <span className="font-bold tracking-tight">{user.employeeCode || 'EMP-XXXX'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                <div className="flex items-center gap-3 group">
                  <div className="bg-white p-2.5 rounded-xl text-brand-500 shadow-sm border border-gray-100 group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Email Address</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="bg-white p-2.5 rounded-xl text-brand-500 shadow-sm border border-gray-100 group-hover:bg-brand-500 group-hover:text-white transition-all">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Phone Number</p>
                    <p className="text-sm font-semibold text-gray-700">{user.phoneNumber || 'Not provided'}</p>
                  </div>
                </div>

                {formattedDob && (
                  <div className="flex items-center gap-3 group">
                    <div className="bg-white p-2.5 rounded-xl text-brand-500 shadow-sm border border-gray-100 group-hover:bg-brand-500 group-hover:text-white transition-all">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Date of Birth</p>
                      <p className="text-sm font-semibold text-gray-700">{formattedDob}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Stats Grid */}
          <div className="w-full flex flex-col divide-y divide-gray-100 bg-gray-50/30">
  <div className="flex w-full gap-4 p-8">

    <Link href="/projects" className="flex-1">
      <StatItem 
        icon={Layers} 
        label="TOTAL PROJECTS" 
        value={stats.totalProjects} 
        color="blue"
      />
    </Link>

    <Link href="/tasks" className="flex-1">
      <StatItem 
        icon={ClipboardCheck} 
        label="ACTIVE TASKS" 
        value={stats.todayTasks} 
        color="teal"
      />
    </Link>

    <Link href="/leaves" className="flex-1">
      <StatItem 
        icon={CalendarDays} 
        label="TOTAL LEAVE" 
        value={stats.totalLeaves} 
        color="purple"
      />
    </Link>

  </div>
</div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value, color }: { icon: any, label: string, value: number, color: 'blue' | 'teal' | 'purple' }) {
  const colors = {
    blue: 'bg-blue-500 shadow-blue-500/20',
    teal: 'bg-teal-500 shadow-teal-500/20',
    purple: 'bg-purple-500 shadow-purple-500/20'
  };

  return (
    <div className={`${colors[color]} flex-1 rounded-2xl p-4 text-white shadow-lg flex flex-col items-center justify-center text-center transform transition-all duration-300 hover:scale-105 group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-12 h-12" />
      </div>
      <Icon className="w-5 h-5 mb-3 opacity-80" />
      <span className="text-[10px] font-bold uppercase tracking-[0.1em] mb-1 opacity-90">{label}</span>
      <span className="text-3xl font-black">{value}</span>
    </div>
  );
}
