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
  onProjectClick?: (projectId: string) => void;
}

export default function DetailedProjectTable({ projects, onProjectClick }: DetailedProjectTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full">
      {/* Premium Gradient Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-2 flex items-center justify-between gap-4 shadow-sm shadow-indigo-100">
        <h3 className="text-white font-black text-[11px] flex items-center gap-2 uppercase tracking-widest">
          <FolderKanban className="w-3.5 h-3.5 opacity-80" />
          Active Assignments
        </h3>
        <div className="flex items-center gap-1.5 text-white/90 text-[9px] font-black uppercase tracking-widest bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 backdrop-blur-md">
          <TrendingUp className="w-3 h-3" />
          {projects.length} Active
        </div>
      </div>

      <div className="p-3">
        {/* Compact Column Labels (Desktop) */}
        <div className="hidden md:grid grid-cols-12 gap-0 px-4 pb-1">
          <div className="col-span-4 text-[9px] font-black text-gray-400 uppercase tracking-widest">Project</div>
          <div className="col-span-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Efficiency</div>
          <div className="col-span-2 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Hours</div>
          <div className="col-span-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-right">Deadline</div>
        </div>

        <div className="space-y-1">
          {projects.length > 0 ? (
            projects.slice(0, 3).map((project) => {
              const remaining = project.allocatedHours - project.workedHours;
              const isOver = remaining < 0;

              return (
                <div 
                  key={project.projectId} 
                  onClick={() => onProjectClick?.(project.projectId)}
                  className={`group bg-gray-50/30 border border-gray-100 rounded-xl p-3 transition-all hover:bg-white hover:shadow-md hover:border-brand-200 ${onProjectClick ? 'cursor-pointer' : ''}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Project Name & Category */}
                    <div className="md:col-span-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                        <h4 className="font-bold text-gray-900 text-sm tracking-tight truncate">
                          {project.name}
                        </h4>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="text-[9px] font-black px-2 py-0.5 bg-brand-50 text-brand-600 rounded-md border border-brand-100">
                          {project.category}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-white text-gray-400 rounded-md border border-gray-100 max-w-[80px] truncate">
                          {project.clientName}
                        </span>
                      </div>
                    </div>

                    {/* Efficiency Logic */}
                    <div className="md:col-span-3">
                      <div className="flex items-center gap-2 font-mono text-[11px]">
                        <span className="text-gray-400 font-bold">{project.allocatedHours}</span>
                        <div className={`px-1.5 py-0.5 rounded-md ${isOver ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'} font-black flex items-center gap-1 border ${isOver ? 'border-red-100' : 'border-green-100'}`}>
                          {remaining.toFixed(1)}
                          {isOver && <AlertCircle className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                    </div>

                    {/* Logged Hrs */}
                    <div className="md:col-span-2 text-center">
                      <span className="text-sm font-black tracking-tight text-gray-700">{project.workedHours.toFixed(1)}h</span>
                    </div>

                    {/* Deadline */}
                    <div className="md:col-span-3 flex flex-col items-end">
                      <div className="flex items-center gap-1.5 text-brand-600 font-black text-[11px] bg-brand-50/50 px-2 py-0.5 rounded-lg border border-brand-100/50">
                        {formatAppDate(project.deadline)}
                        <Calendar className="w-3 h-3 opacity-70" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-10 text-center text-gray-400 italic bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="font-bold uppercase tracking-widest text-[10px]">No active assignments</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white px-4 py-2 border-t border-gray-50 flex items-center justify-end">
        <Link 
          href="/projects" 
          className="text-[10px] font-black text-gray-400 hover:text-brand-600 uppercase tracking-widest flex items-center gap-2 group"
        >
          View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
