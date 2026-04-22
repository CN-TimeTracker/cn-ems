'use client';

import { User } from '@/types';
import { 
  Mail, 
  Phone, 
  Quote as QuoteIcon
} from 'lucide-react';
import { formatAppDate } from '@/lib/dateUtils';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import QuoteService from '@/services/quote.service';

interface DashboardProfileHeaderProps {
  user: User;
  stats: {
    totalProjects: number;
    todayTasks: number;
    totalLeaves: number;
  };
}

export default function DashboardProfileHeader({ user }: DashboardProfileHeaderProps) {
  return (
    <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-4 group">
      {/* Decorative Gradient Accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-brand-50/50 to-transparent pointer-events-none" />
      
      <div className="relative flex flex-col md:flex-row items-center gap-6 p-5">
        {/* Profile Image with Ring Detail */}
        <div className="relative shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-white p-1 shadow-md ring-1 ring-brand-100/50 relative group-hover:scale-105 transition-transform duration-500">
            {user.profilePicture ? (
              <Image 
                src={user.profilePicture} 
                alt={user.name} 
                fill 
                className="object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-black text-3xl rounded-xl">
                {user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-5 h-5 rounded-full border-[3px] border-white shadow-lg" />
        </div>

        {/* User Info & Expanded Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              {user.name}
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-brand-600 bg-brand-50/80 backdrop-blur-sm px-3 py-1 rounded-full uppercase tracking-widest border border-brand-100/50 shadow-sm">
                {user.role}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                {user.employeeCode}
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-gray-500 mb-4 px-1">
            <div className="flex items-center gap-2 group/text cursor-default">
              <div className="p-1.5 bg-gray-50 rounded-lg group-hover/text:bg-brand-50 transition-colors">
                <Mail className="w-3.5 h-3.5 text-brand-400" />
              </div>
              <span className="text-xs font-semibold tracking-tight group-hover/text:text-gray-900 transition-colors">{user.email}</span>
            </div>
            {user.phoneNumber && (
              <div className="flex items-center gap-2 group/text cursor-default">
                <div className="p-1.5 bg-gray-50 rounded-lg group-hover/text:bg-brand-50 transition-colors">
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                </div>
                <span className="text-xs font-semibold tracking-tight group-hover/text:text-gray-900 transition-colors">{user.phoneNumber}</span>
              </div>
            )}
          </div>

          <div className="max-w-3xl">
            <DailyQuote />
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyQuote() {
  const { data: quote, isLoading } = useQuery({
    queryKey: ['daily-quote'],
    queryFn: QuoteService.getDailyQuote,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  if (isLoading) return <div className="h-4 w-64 bg-gray-50 animate-pulse rounded-full" />;
  if (!quote) return null;

  return (
    <div className="flex items-start gap-4 p-3 bg-gradient-to-r from-brand-50/30 to-white rounded-2xl border border-brand-50/50 group/quote hover:shadow-sm transition-all">
      <div className="p-2 bg-white rounded-xl shadow-sm border border-brand-100 text-brand-400 group-hover/quote:text-brand-600 transition-colors">
        <QuoteIcon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-600 italic leading-relaxed line-clamp-1 group-hover/quote:line-clamp-none transition-all">
          "{quote.text}"
        </p>
        <p className="text-[10px] font-black text-brand-400 uppercase tracking-[0.2em] mt-1.5 opacity-60">
          — {quote.author}
        </p>
      </div>
    </div>
  );
}
