'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTasks, useDeleteTask, useStartTimer, usePauseTimer, useStopTimer, useActiveProjects, useActiveEmployees } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole, TaskStatus, Task } from '@/types';
import { Plus, Filter, Pause, Play, StopCircle, RefreshCcw, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import TaskModal from '@/components/tasks/TaskModal';
import ReopenTaskModal from '@/components/tasks/ReopenTaskModal';

// ---------------- TIMER CELL ----------------
function TaskTimerCell({
  task,
  hasRunningTask,
  setAlertMessage,
  onReopen,
}: {
  task: Task;
  hasRunningTask: boolean;
  setAlertMessage: (msg: string) => void;
  onReopen: (task: Task) => void;
}) {
  const { mutate: startTimer } = useStartTimer();
  const { mutate: pauseTimer } = usePauseTimer();
  const { mutate: stopTimer } = useStopTimer();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (task.isRunning && task.lastStartedAt) {
      const startTime = new Date(task.lastStartedAt).getTime();

      const updateElapsed = () => {
        const now = Date.now();
        setElapsedSeconds(Math.floor((now - startTime) / 1000));
      };

      updateElapsed();
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedSeconds(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [task.isRunning, task.lastStartedAt]);

  const totalMinutes =
    (task.totalMinutesSpent || 0) + elapsedSeconds / 60;

  const formatTime = () => {
    const h = Math.floor(totalMinutes / 60);
    const m = Math.floor(totalMinutes % 60);
    const s = Math.floor((totalMinutes * 60) % 60);
    return task.isRunning ? `${h}h ${m}m ${s}s` : `${h}h ${m}m`;
  };

  const isCompleted =
    task.status === TaskStatus.ProjectCompleted;

  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-[16px] font-mono font-bold ${
          task.isRunning
            ? 'text-primary animate-pulse'
            : 'text-gray-500'
        }`}
      >
        {formatTime()}
      </span>

      <div className="flex items-center gap-1">
        {isCompleted ? (
          <button
            onClick={() => onReopen(task)}
            className="p-1 rounded bg-green-50 text-green-600 hover:bg-green-100 flex items-center gap-1 px-2"
          >
            <RefreshCcw className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Reopen</span>
          </button>
        ) : task.isRunning ? (
          <button
            onClick={() => pauseTimer(task._id)}
            className="p-1 rounded bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
          >
            <Pause className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={() => {
              if (isCompleted) {
                setAlertMessage('This task is already completed.');
                return;
              }

              if (hasRunningTask && !task.isRunning) {
                setAlertMessage('Another task is already running. Please stop it first.');
                return;
              }

              startTimer(task._id);
            }}
            className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
          >
            <Play className="w-5 h-5 fill-current" />
          </button>
        )}

        {!isCompleted && (
          <button
            onClick={() => stopTimer(task._id)}
            className="p-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------- PAGE ----------------
export default function TasksPage() {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = user?.role === UserRole.Admin;

  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [reopenModalOpen, setReopenModalOpen] = useState(false);
  const [reopeningTask, setReopeningTask] = useState<Task | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
  const startPickerRef = useRef<HTMLInputElement>(null);
  const endPickerRef = useRef<HTMLInputElement>(null);

  const { data: tasks, isLoading } = useTasks(filters);
  const { mutate: deleteTask } = useDeleteTask();
  const { data: projects } = useActiveProjects();
  const { data: employees } = useActiveEmployees();

  const hasRunningTask = useMemo(() => {
    return tasks?.some((t) => t.isRunning);
  }, [tasks]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({
      ...prev,
      [key]: value || undefined,
    }));
  };

  const handleDateFilterChange = (key: 'startDate' | 'endDate', value: string) => {
    // Keep the typed value for display
    const displayKey = key === 'startDate' ? 'displayStartDate' : 'displayEndDate';
    setFilters((prev: any) => {
      const next = { ...prev, [displayKey]: value };
      
      // If it matches DD/MM/YYYY, also set the standard format for the backend
      const parts = value.split('/');
      if (parts.length === 3) {
        const [d, m, y] = parts.map(Number);
        if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 1000) {
          const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          next[key] = iso;
        } else {
          delete next[key];
        }
      } else if (!value) {
        delete next[key];
      }
      return next;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Task List</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter className="w-4 h-4" /> Filters
          </button>

          {!isAdmin && (
            <button
              onClick={() => {
                if (hasRunningTask) {
                  setAlertMessage('A task is already running. Please stop it first.');
                  return;
                }
                setModalOpen(true);
              }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* FILTERS BAR */}
      {showFilters && (
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 transition-all">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Project Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
              <select
                value={filters.projectId || ''}
                onChange={(e) => handleFilterChange('projectId', e.target.value)}
                className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="">All Projects</option>
                {projects?.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
              >
                <option value="">All Statuses</option>
                {Object.values(TaskStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To Filter (Admin Only) */}
            {isAdmin && (
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Employee</label>
                <select
                  value={filters.assignedTo || ''}
                  onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
                  className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                >
                  <option value="">All Employees</option>
                  {employees?.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Start Date */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={filters.displayStartDate || ''}
                  onChange={(e) => handleDateFilterChange('startDate', e.target.value)}
                  className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => startPickerRef.current?.showPicker()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
                <input
                  ref={startPickerRef}
                  type="date"
                  className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                  onChange={(e) => handleDateFilterChange('startDate', format(new Date(e.target.value), 'dd/MM/yyyy'))}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={filters.displayEndDate || ''}
                  onChange={(e) => handleDateFilterChange('endDate', e.target.value)}
                  className="w-full text-sm border-gray-200 rounded-lg focus:ring-primary focus:border-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => endPickerRef.current?.showPicker()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-primary transition-colors"
                >
                  <CalendarIcon className="w-4 h-4" />
                </button>
                <input
                  ref={endPickerRef}
                  type="date"
                  className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                  onChange={(e) => handleDateFilterChange('endDate', format(new Date(e.target.value), 'dd/MM/yyyy'))}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 transition-colors"
            >
              <RefreshCcw className="w-3 h-3" /> Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* EMPTY */}
      {!tasks?.length ? (
        <EmptyState
          title="No task logs found"
          description="Create your first task"
        />
      ) : (
        <div className="bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead className="bg-black text-white">
              <tr>
                <th className="p-4">Project</th>
                <th>Work Type</th>
                <th>Description</th>
                <th>Status</th>
                <th>Timer</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr key={task._id} className="border-b">
                  <td className="p-4">
                    {(task.projectId as any)?.name}
                  </td>
                  <td>{task.workType}</td>
                  <td>{task.description}</td>
                  <td>{task.status}</td>
                  <td>
                    <TaskTimerCell
                      task={task}
                      hasRunningTask={hasRunningTask}
                      setAlertMessage={setAlertMessage}
                      onReopen={(t) => {
                        if (hasRunningTask) {
                          setAlertMessage('Another task is already running. Please stop it first.');
                          return;
                        }
                        setReopeningTask(t);
                        setReopenModalOpen(true);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />

      <ReopenTaskModal
        open={reopenModalOpen}
        onClose={() => {
          setReopenModalOpen(false);
          setReopeningTask(null);
        }}
        task={reopeningTask}
      />

      {/* 🔴 CUSTOM ALERT MODAL */}
      {alertMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-2xl p-6 w-[320px] shadow-xl">
            <h2 className="text-lg font-semibold mb-2">
              Action Not Allowed
            </h2>

            <p className="text-sm text-gray-500 mb-5">
              {alertMessage}
            </p>

            <div className="flex justify-end">
              <button
                onClick={() => setAlertMessage(null)}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}