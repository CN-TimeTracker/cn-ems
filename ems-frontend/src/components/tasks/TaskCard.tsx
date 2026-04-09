'use client';

import { Task, TaskStatus, UserRole } from '@/types';
import { 
  Calendar, 
  User as UserIcon, 
  Pencil, 
  Trash2, 
  MoreVertical,
  Clock,
  Play,
  Pause,
  StopCircle,
  Timer
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { formatAppDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';
import { useState, useEffect, useMemo } from 'react';
import { useStartTimer, usePauseTimer, useStopTimer } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';

interface TaskCardProps {
  task: Task;
  isAdmin: boolean;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export default function TaskCard({ task, isAdmin, onEdit, onDelete }: TaskCardProps) {
  const currentUser = useAppSelector(selectCurrentUser);
  const [showMenu, setShowMenu] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  const { mutate: startTimer, isPending: starting } = useStartTimer();
  const { mutate: pauseTimer, isPending: pausing } = usePauseTimer();
  const { mutate: stopTimer, isPending: stopping } = useStopTimer();

  const isAssignedToMe = currentUser?._id === (typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo._id);

  // Real-time ticking effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (task.isRunning && task.lastStartedAt) {
      const startTime = new Date(task.lastStartedAt).getTime();
      
      const updateElapsed = () => {
        const now = Date.now();
        const diffInSeconds = Math.floor((now - startTime) / 1000);
        setElapsedSeconds(diffInSeconds);
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => clearInterval(interval);
  }, [task.isRunning, task.lastStartedAt]);

  const totalDisplayMinutes = useMemo(() => {
    const baseMinutes = task.totalMinutesSpent || 0;
    const currentSessionMinutes = elapsedSeconds / 60;
    return baseMinutes + currentSessionMinutes;
  }, [task.totalMinutesSpent, elapsedSeconds]);

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    const s = Math.floor((totalMinutes * 60) % 60);
    return `${h}h ${m}m ${task.isRunning ? `${s}s` : ''}`.trim();
  };

  return (
    <div className={cn(
      'group bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 relative',
      task.isRunning && 'ring-2 ring-primary ring-opacity-50 border-primary bg-primary/5'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter mb-1 truncate">
            {(task.projectId as any)?.name}
          </p>
          <h4 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
            {task.workType}
          </h4>
        </div>
        
        {(isAdmin || isAssignedToMe) && (
          <div className="relative ml-2">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                  <button 
                    onClick={() => { onEdit(task); setShowMenu(false); }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  {isAdmin && (
                    <button 
                      onClick={() => { onDelete(task._id); setShowMenu(false); }}
                      className="w-full px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Timer Controls (only for assigned user) */}
      {isAssignedToMe && (
        <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-gray-50 mb-4 group-hover:border-primary/20 transition-colors">
          <div className="flex items-center gap-2">
            {task.isRunning ? (
              <button 
                onClick={() => pauseTimer(task._id)}
                disabled={pausing}
                className="p-1.5 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
                title="Pause"
              >
                <Pause className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={() => startTimer(task._id)}
                disabled={starting}
                className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                title="Start/Resume"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            )}
            <button 
              onClick={() => stopTimer(task._id)}
              disabled={stopping}
              className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              title="Stop & Mark Done"
            >
              <StopCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-col items-end">
            <span className={cn(
              "text-xs font-mono font-bold",
              task.isRunning ? "text-primary animate-pulse" : "text-gray-500"
            )}>
              {formatTime(totalDisplayMinutes)}
            </span>
            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
              {task.isRunning ? 'Active Now' : 'Total Spent'}
            </span>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="info" className="text-[10px] px-1.5 py-0 truncate max-w-[180px]">
            {task.status}
          </Badge>
        </div>

        {/* User & Date */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          {!isAssignedToMe && (
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center border border-brand-100">
                <UserIcon className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-medium text-gray-600 truncate">
                {(task.assignedTo as any)?.name}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 ml-auto">
             {!isAssignedToMe && task.totalMinutesSpent > 0 && (
               <div className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                 <Timer className="w-3 h-3" />
                 <span>{Math.floor(task.totalMinutesSpent / 60)}h {Math.floor(task.totalMinutesSpent % 60)}m</span>
               </div>
             )}
            <div className="flex items-center gap-1 text-[10px] whitespace-nowrap text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{formatAppDate(task.date)}</span>
              <Clock className="w-3 h-3 ml-1" />
              <span>{task.time || '--:--'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
