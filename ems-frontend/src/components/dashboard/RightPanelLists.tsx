'use client';

import { Calendar, ChevronRight, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useHolidays, useAllProjects } from '@/hooks';

export function HolidayList() {
  const { data: holidaysData, isLoading } = useHolidays();
  
  // Format dates consistently
  const formattedHolidays = holidaysData?.slice(0, 4).map((h: any) => {
     const pDate = new Date(h.date);
     return {
       date: pDate.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }),
       name: h.name
     };
  }) || [];

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col h-full">
      <h3 className="text-[11px] font-black text-[#1A2B48] uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">Upcoming Holidays</h3>
      <div className="space-y-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : formattedHolidays.length > 0 ? (
          formattedHolidays.map((h: any, i: number) => (
            <div key={i} className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-[#1A2B48]" />
               <span className="text-[11px] font-black text-[#1A2B48] w-14">{h.date}</span>
               <span className="text-[11px] font-bold text-[#8A92A6] truncate">{h.name}</span>
            </div>
          ))
        ) : (
          <div className="text-[10px] uppercase font-bold text-gray-400">No upcoming holidays</div>
        )}
      </div>
    </div>
  );
}

export function ComplianceDocList() {
  const { data: projects, isLoading } = useAllProjects();
  
  const items = projects?.slice(0, 3).map(p => p.name) || [
    'View Upcoming Deadlines',
    'Upload Activity Files',
    'Process Checklists'
  ];

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-card flex flex-col h-full mt-4">
      <h3 className="text-[11px] font-black text-[#1A2B48] uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">System Resources</h3>
      <div className="space-y-4 flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : (
          items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 group cursor-pointer">
               <div className="w-1.5 h-1.5 rounded-full bg-[#1A2B48]" />
               <span className="text-[11px] font-bold text-[#8A92A6] group-hover:text-[#2563EB] transition-colors truncate">{item}</span>
            </div>
          ))
        )}
      </div>
      <div className="mt-auto pt-6 border-t border-gray-50">
        <Link href="/projects" className="px-5 py-2 bg-[#F3F7FF] text-[#2563EB] text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#EBF2FF] transition-colors inline-block w-full text-center">
          Explore Projects
        </Link>
      </div>
    </div>
  );
}
