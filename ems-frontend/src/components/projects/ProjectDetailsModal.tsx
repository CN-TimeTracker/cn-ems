'use client';

import { Project, User, ProjectStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { 
  Building2, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Clock3,
  Target
} from 'lucide-react';
import { formatAppDate, formatDecimalHours } from '@/lib/dateUtils';
import { useProjectRemainingHours } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

function ProjectTimeline({ startDate, deadline }: { startDate: string; deadline: string }) {
  const start = new Date(startDate);
  const end = new Date(deadline);
  const total = end.getTime() - start.getTime();
  const current = new Date().getTime() - start.getTime();
  const progress = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Timeline</p>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
            <Calendar className="w-4 h-4 text-brand-500" />
            <span>{formatAppDate(startDate)} — {formatAppDate(deadline)}</span>
          </div>
        </div>
        <div className="text-right space-y-1">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Progress</p>
          <p className="text-sm font-black text-brand-600">{progress.toFixed(0)}% Time Elapsed</p>
        </div>
      </div>
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
        <div 
          className="h-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function HoursProgress({ projectId, allocated }: { projectId: string; allocated: number }) {
  const { data: remaining, isLoading } = useProjectRemainingHours(projectId);

  if (isLoading || !remaining) return (
    <div className="h-16 w-full bg-gray-50 animate-pulse rounded-xl" />
  );

  const percentage = allocated > 0 ? (remaining.spent / allocated) * 100 : 0;
  const isOver = remaining.remaining < 0;

  return (
    <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isOver ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
            <Clock3 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Hours Allocation</p>
            <p className="text-xs font-bold text-gray-700">{formatDecimalHours(remaining.spent)} / {formatDecimalHours(allocated)} Spent</p>
          </div>
        </div>
        <div className="text-right">
          <p className={`text-sm font-black ${isOver ? 'text-red-500' : 'text-brand-600'}`}>
            {isOver ? (
              <span className="flex items-center gap-1 justify-end">
                <AlertCircle className="w-3.5 h-3.5" />
                {formatDecimalHours(Math.abs(remaining.remaining))} over
              </span>
            ) : (
              `${formatDecimalHours(remaining.remaining)} left`
            )}
          </p>
        </div>
      </div>
      <div className="h-2.5 w-full bg-gray-200/50 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-700 ${isOver ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-brand-500'}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

export default function ProjectDetailsModal({ open, onClose, project }: Props) {
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'Admin';
  const { data: remaining } = useProjectRemainingHours(project?._id || '');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  if (!project) return null;

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="Project Details"
      maxWidth="max-w-2xl"
    >
      <div className="p-6 md:p-8 space-y-8 max-h-[85vh] overflow-y-auto custom-scrollbar">
        
        {/* 1. Header Info */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-none">
                {project.name}
              </h2>
              <Badge 
                variant={project.status === ProjectStatus.Active ? 'success' : 'default'}
                className="uppercase text-[10px] tracking-widest px-2 py-0.5"
              >
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-brand-600 font-bold bg-brand-50/50 px-3 py-1 rounded-lg border border-brand-100 w-fit">
              <Building2 className="w-4 h-4" />
              <span className="text-sm">{project.clientName}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-black border border-gray-200">
              {project.category}
            </span>
          </div>
        </div>

        {/* 2. Description Section */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
            Description
          </h3>
          <div className="bg-gray-50/30 border border-gray-100 rounded-xl p-4 italic text-gray-600 text-[14px] leading-relaxed">
            {project.description || 'No description provided for this project.'}
          </div>
        </div>

        {/* 3. Progress Grids */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              Time Stats
            </h3>
            <ProjectTimeline 
              startDate={project.startDate} 
              deadline={project.deadline} 
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3.5 h-3.5" />
              Hours Efficiency
            </h3>
            <HoursProgress 
              projectId={project._id} 
              allocated={project.allocatedHours} 
            />
          </div>
        </div>

        {/* 4. Team Members & Individual Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Team Contribution ({project.assignedTo?.length || 0})
            </h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {remaining?.userBreakdown?.length ? (
              remaining.userBreakdown.map((u: any, idx: number) => (
                <div key={idx} className="group">
                  <div 
                    onClick={() => isAdmin && setExpandedUser(expandedUser === u.userId ? null : u.userId)}
                    className={`flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm transition-all ${isAdmin ? 'cursor-pointer hover:border-brand-300 hover:shadow-md' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 font-black text-xs border border-brand-100">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-gray-900 leading-none mb-1">{u.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{u.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[12px] font-black text-brand-600 leading-none mb-1">{formatDecimalHours(u.totalHours)}</p>
                        <p className="text-[9px] font-bold text-gray-400 uppercase">Logged</p>
                      </div>
                      {isAdmin && (
                        <div className="text-gray-300 group-hover:text-brand-500 transition-colors">
                          {expandedUser === u.userId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Admin Only: Task Breakdown Accordion */}
                  {isAdmin && expandedUser === u.userId && (
                    <div className="mt-2 ml-4 pl-4 border-l-2 border-brand-100 space-y-2 animate-in slide-in-from-top-2 duration-200">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Task History</p>
                      {u.tasks.map((task: any, tIdx: number) => (
                        <div key={tIdx} className="bg-gray-50/50 rounded-xl p-3 border border-gray-100 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 p-1 bg-white rounded-lg border border-gray-200">
                              <FileText className="w-3 h-3 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-gray-800 leading-snug">{task.title}</p>
                              <p className="text-[9px] text-gray-400 font-medium">{formatAppDate(task.date)}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-black text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg border border-brand-100">
                              {formatDecimalHours(task.hours)}
                            </span>
                            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">{task.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="w-full py-8 text-center border-2 border-dashed border-gray-100 rounded-3xl bg-gray-50/30">
                <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-400 italic">No activity logged yet</p>
              </div>
            )}
          </div>
        </div>

        {/* 5. Footer Details */}
        <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium italic">
             Created by {project.createdBy?.name || 'Admin'} on {formatAppDate(project.createdAt)}
           </div>
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-[#1A2B48] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-900/10 active:scale-95"
           >
             Close View
           </button>
        </div>
      </div>
    </Modal>
  );
}
