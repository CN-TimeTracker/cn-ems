'use client';

import { formatAppDate } from '@/lib/dateUtils';
import { 
  FolderKanban, 
  Clock, 
  Calendar, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ProjectBreakdownItem {
  projectId: string;
  name: string;
  clientName: string;
  category: string;
  allocatedHours: number;
  workedHours: number;
  deadline: string;
}

interface DetailedProjectTableProps {
  projects: ProjectBreakdownItem[];
}

export default function DetailedProjectTable({ projects }: DetailedProjectTableProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="bg-brand-600 px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0">
          <h3 className="text-white font-black text-xl flex items-center gap-3 uppercase tracking-tighter font-medium">
            <FolderKanban className="w-6 h-6 opacity-80" />
            Current Projects
          </h3>
          <p className="text-brand-100/60 text-[10px] font-bold uppercase tracking-[0.2em] px-1">Active workload overview</p>
        </div>
        <div className="flex items-center gap-2 text-brand-100 text-xs font-black uppercase tracking-widest bg-brand-700/50 px-4 py-2.5 rounded-2xl border border-brand-500/30 backdrop-blur-sm self-start md:self-center">
          <TrendingUp className="w-3.5 h-3.5" />
          {projects.length} ACTIVE PROJECTS
        </div>
      </div>

      <div className="p-4 md:p-6 space-y-4">
        {/* Column Labels (Desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-0 px-8 pb-2">
          <div className="col-span-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Project Details</div>
          <div className="col-span-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Efficiency (EST-WH=RH)</div>
          <div className="col-span-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Hrs Worked</div>
          <div className="col-span-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right text-brand-500">End Date</div>
        </div>

        {projects.length > 0 ? (
          projects.slice(0, 3).map((project) => {
            const remaining = project.allocatedHours - project.workedHours;
            const isOver = remaining < 0;

            return (
              <div 
                key={project.projectId} 
                className="group relative bg-white border border-gray-100 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/5 hover:border-brand-200 hover:-translate-y-1 overflow-hidden"
              >
                {/* Decorative background element */}
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-500 text-brand-900 pointer-events-none">
                  <FolderKanban className="w-24 h-24 rotate-12" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Project Name & Category */}
                  <div className="md:col-span-4 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-brand-500 ring-4 ring-brand-50" />
                      <h4 className="font-extrabold text-gray-900 text-lg tracking-tight group-hover:text-brand-600 transition-colors">
                        {project.name}
                      </h4>
                    </div>
                    <div className="flex gap-2">
                      <span className="inline-block text-[10px] font-black tracking-widest uppercase px-3 py-1 bg-brand-50 text-brand-600 rounded-full shadow-sm border border-brand-100 transition-colors">
                        {project.category}
                      </span>
                      <span className="inline-block text-[10px] font-bold tracking-widest uppercase px-3 py-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100 transition-colors">
                        {project.clientName}
                      </span>
                    </div>
                  </div>

                  {/* Hours Logic */}
                  <div className="md:col-span-3">
                    <div className="flex items-center gap-3 font-mono text-sm">
                      <span className="text-gray-400 font-bold">{project.allocatedHours}</span>
                      <span className="h-0.5 w-3 bg-gray-200" />
                      <span className="text-brand-500 font-bold">{project.workedHours.toFixed(1)}</span>
                      <span className="h-0.5 w-3 bg-gray-200" />
                      <div className={`px-2 py-1 rounded-lg ${isOver ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} font-black flex items-center gap-1.5 shadow-sm border ${isOver ? 'border-red-100' : 'border-green-100'}`}>
                        {remaining.toFixed(1)}
                        {isOver && <AlertCircle className="w-3.5 h-3.5 animate-pulse" />}
                      </div>
                    </div>
                  </div>

                  {/* Logged Hrs */}
                  <div className="md:col-span-2">
                    <div className="flex items-center gap-2.5 text-gray-700">
                      <div className="p-2 bg-brand-50 rounded-xl group-hover:bg-brand-500 group-hover:text-white transition-colors">
                        <Clock className="w-4 h-4 text-inherit" />
                      </div>
                      <span className="text-lg font-black tracking-tight">{project.workedHours.toFixed(1)}h</span>
                    </div>
                  </div>

                  {/* Deadline */}
                  <div className="md:col-span-3 flex flex-col items-start md:items-end gap-1">
                    <div className="flex items-center gap-2 text-brand-600 font-black text-sm group-hover:scale-105 transition-transform bg-brand-50/50 px-3 py-1.5 rounded-xl border border-brand-100/50">
                      {formatAppDate(project.deadline)}
                      <Calendar className="w-4 h-4 opacity-70" />
                    </div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest px-1">Target Completion</p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center text-gray-400 italic bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
            <div className="flex flex-col items-center gap-4 opacity-50">
              <FolderKanban className="w-16 h-16 text-gray-300" />
              <p className="font-bold uppercase tracking-[0.2em] text-xs">No active assignments found</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white px-8 py-6 border-t border-gray-50 flex items-center justify-end">
        <Link 
          href="/projects" 
          className="text-xs font-black text-gray-400 hover:text-brand-600 uppercase tracking-[0.3em] flex items-center gap-3 group transition-all"
        >
          Explore All Assignments
          <div className="p-2 bg-gray-50 rounded-full group-hover:bg-brand-500 group-hover:text-white group-hover:rotate-[-45deg] transition-all">
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
