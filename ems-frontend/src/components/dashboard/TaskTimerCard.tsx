'use client';

import { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Timer, 
  Briefcase, 
  MessageSquare,
  Loader2
} from 'lucide-react';
import { useAssignedProjects, useCreateLog, useMyProjectTodayHours, useTasks } from '@/hooks';
import { useTimer } from '@/hooks/useTimer';
import  Badge  from '@/components/ui/Badge';

export default function TaskTimerCard() {
  const [projectId, setProjectId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  
  const { data: projects, isLoading: projectsLoading } = useAssignedProjects();
  const { data: tasks, isLoading: tasksLoading } = useTasks({ projectId });
  const createLogMut = useCreateLog();
  
  const { 
    seconds, 
    isActive, 
    isPaused, 
    start, 
    pause, 
    resume, 
    stop, 
    setSeconds,
    formatDuration 
  } = useTimer();

  // Fetch existing hours for this project today to resume the timer
  const { 
    data: initialHours, 
    isFetching: isFetchingInitial,
    refetch: refetchInitial
  } = useMyProjectTodayHours(projectId, !isActive);

  // Resume timer from already logged hours when project changes
  useEffect(() => {
    if (projectId && initialHours !== undefined && !isActive) {
      setSeconds(Math.floor(initialHours * 3600));
    } else if (!projectId) {
      setSeconds(0);
    }
  }, [projectId, initialHours, isActive, setSeconds]);

  const handleStart = () => {
    if (!projectId || !taskId) return;
    setSessionStartTime(new Date());
    start();
  };

  const handleStop = async () => {
    const totalSeconds = seconds;
    const prevSeconds = Math.floor((initialHours || 0) * 3600);
    const sessionSeconds = totalSeconds - prevSeconds;
    const endTime = new Date();
    
    stop();

    if (sessionSeconds < 60) return;

    const hours = Number((sessionSeconds / 3600).toFixed(2));
    
    createLogMut.mutate({
      projectId,
      taskId,
      hours,
      startTime: sessionStartTime?.toISOString() || new Date().toISOString(),
      endTime: endTime.toISOString(),
    }, {
      onSuccess: () => {
        setTaskId('');
        setSessionStartTime(null);
        refetchInitial();
      }
    });
  };

  const selectedProject = projects?.find(p => p._id === projectId);
  const selectedTask = tasks?.find(t => t._id === taskId);

  return (
    <div className="bg-white rounded-2xl border border-brand-100 shadow-sm overflow-hidden transition-all duration-300">
      <div className="px-6 py-4 border-b border-brand-50 bg-brand-50/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={`w-5 h-5 ${isActive && !isPaused ? 'text-brand-600 animate-pulse' : 'text-gray-400'}`} />
          <h3 className="font-semibold text-gray-900">Task Tracker</h3>
        </div>
        {isActive && (
          <Badge variant={isPaused ? 'default' : 'info'} className="animate-in fade-in zoom-in duration-300">
            {isPaused ? 'Paused' : 'In Progress'}
          </Badge>
        )}
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">
              <Briefcase className="w-3.5 h-3.5" />
              Project
            </label>
            <select
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setTaskId(''); // Reset task when project changes
              }}
              disabled={isActive}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none disabled:opacity-60 disabled:cursor-not-allowed appearance-none font-medium text-gray-700"
            >
              <option value="">Select a project...</option>
              {projects?.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            {projectsLoading && <p className="text-[10px] text-gray-400 animate-pulse ml-1">Loading projects...</p>}
          </div>

          {/* Task Selection Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 ml-1">
              <MessageSquare className="w-3.5 h-3.5" />
              Select Task
            </label>
            <select
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
              disabled={isActive || !projectId}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed appearance-none font-medium text-gray-700"
            >
              <option value="">{projectId ? 'Choose a task...' : 'Select a project first'}</option>
              {tasks?.map((t) => (
                <option key={t._id} value={t._id}>{t.workType}</option>
              ))}
            </select>
            {tasksLoading && <p className="text-[10px] text-gray-400 animate-pulse ml-1">Loading tasks...</p>}
            {!tasksLoading && projectId && tasks?.length === 0 && (
              <p className="text-[10px] text-amber-500 ml-1">No tasks assigned for this project.</p>
            )}
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gray-50 mt-2">
          <div className="text-4xl font-bold tabular-nums tracking-tighter text-gray-900 bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100 shadow-inner">
            {formatDuration(seconds)}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {!isActive ? (
              <button
                onClick={handleStart}
                disabled={!projectId || !taskId || createLogMut.isPending || isFetchingInitial}
                className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-brand-200 hover:shadow-brand-300 active:scale-95 disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none"
              >
                {isFetchingInitial ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-current" />}
                {isFetchingInitial ? 'Syncing...' : 'Start Task'}
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={resume}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={pause}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all active:scale-95 border border-gray-200"
                  >
                    <Pause className="w-5 h-5 fill-current" />
                    Pause
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm('Finish this task and log your time?')) handleStop();
                  }}
                  disabled={createLogMut.isPending}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  {createLogMut.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5 fill-current" />}
                  Stop
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
