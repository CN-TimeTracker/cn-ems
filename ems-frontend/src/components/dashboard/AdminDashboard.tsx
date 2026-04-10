'use client';

import { useState } from 'react';

import { 
  useAdminDashboard, 
  useAdminProjectBreakdown,
  useAllLogs,
  useAllUsers,
  useAllProjects,
  useTasks
} from '@/hooks';
import StatsCard from './StatsCard';
import AttendanceSummaryCard from './AttendanceSummaryCard';
import ProfileSummaryCard from './ProfileSummaryCard';
import { 
  Users, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  ClipboardList,
  BarChart3,
  UserX,
  Target,
  History,
  Filter
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import { WorkLog } from '@/types';

interface IProjectBreakdown {
  projectName: string;
  userName: string;
  totalHours: number;
}

export default function AdminDashboard() {
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [showFilters, setShowFilters] = useState(false);
  const [filterEmployeeId, setFilterEmployeeId] = useState('');
  const [filterProjectId, setFilterProjectId] = useState('');
  const [filterTaskId, setFilterTaskId] = useState('');

  const { data, isLoading, error } = useAdminDashboard();
  const { data: breakdown, isLoading: breakdownLoading } = useAdminProjectBreakdown() as { data: IProjectBreakdown[], isLoading: boolean };
  const { data: allLogs, isLoading: logsLoading } = useAllLogs({
    startDate: todayStr,
    endDate: todayStr,
  });

  const { data: allUsers } = useAllUsers();
  const { data: allProjects } = useAllProjects();
  const { data: allTasks } = useTasks();

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  );

  if (error || !data) return (
    <EmptyState 
      title="Failed to load dashboard" 
      description="There was an error fetching the dashboard data. Please try again."
      icon={AlertCircle}
    />
  );

  const formatTime = (dateStr: string | undefined) => {
    if (!dateStr) return '--:--';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (hours: number | undefined) => {
    if (!hours) return '0h';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const filteredLogs = (allLogs as WorkLog[])?.filter(log => {
    const empMatch = !filterEmployeeId || log.userId?._id === filterEmployeeId;
    const projMatch = !filterProjectId || log.projectId?._id === filterProjectId;
    const taskMatch = !filterTaskId || log.taskId?._id === filterTaskId;
    return empMatch && projMatch && taskMatch;
  }) || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <ProfileSummaryCard />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Users Logged Today" 
          value={data.totalUsersLogged} 
          icon={Users}
          description="Total employees who logged time today"
        />
        {/* <StatsCard 
          title="Total Hours Today" 
          value={`${data.totalHoursToday}h`} 
          icon={Clock}
          description="Cumulative hours across all projects"
        /> */}
        <StatsCard 
          title="Not Logged Today" 
          value={data.usersNotLoggedToday.length} 
          icon={AlertCircle}
          className={data.usersNotLoggedToday.length > 0 ? 'border-red-100 bg-red-50/30' : ''}
          description="Employees who haven't logged any time"
        />
        <StatsCard 
          title="No Tasks Assigned" 
          value={data.usersWithNoTasks.length} 
          icon={UserX}
          description="Employees with an empty task queue"
        />
      </div>

      {/* Today's Attendance Summary */}
      <AttendanceSummaryCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Under 4 Hours */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" />
              Users Under 4 Hours
            </h3>
            <Badge variant="warning">{data.usersUnder4Hours.length} Users</Badge>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {data.usersUnder4Hours.length > 0 ? (
              data.usersUnder4Hours.map(({ user, totalHours }) => (
                <div key={user._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-amber-600">{formatDuration(totalHours)}</p>
                    <p className="text-[10px] text-gray-400">Logged today</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-400 italic text-sm">
                All logged-in users have at least 4 hours today.
              </div>
            )}
          </div>
        </div>

        {/* Not Logged Today */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <UserX className="w-4 h-4 text-red-500" />
              Not Logged Today
            </h3>
            <Badge variant="danger">{data.usersNotLoggedToday.length} Users</Badge>
          </div>
          <div className="divide-y divide-gray-50 max-h-[400px] overflow-y-auto">
            {data.usersNotLoggedToday.length > 0 ? (
              data.usersNotLoggedToday.map((user) => (
                <div key={user._id} className="px-6 py-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-red-50 text-red-700 flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-brand-600 font-medium">{user.role}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-400 italic text-sm">
                Everyone has logged time today!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Project Hours Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-brand-600" />
              Project Distribution
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {data.projectHours.map((project) => (
                <div key={project.project}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{project.project}</span>
                    <span className="text-sm font-bold text-brand-700">{formatDuration(project.totalHours)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${Math.min(100, (project.totalHours / data.totalHoursToday) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
              {data.projectHours.length === 0 && (
                <p className="text-center text-gray-400 py-8 italic text-sm">No project time logged today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Team Project Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" />
              Team Project Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider font-bold border-b border-gray-50">
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Employee</th>
                  <th className="px-6 py-3 text-right">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {breakdownLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 ml-auto"></div></td>
                    </tr>
                  ))
                ) : (breakdown && (breakdown as any).length > 0) ? (
                  (breakdown as any).map((row: IProjectBreakdown, i: number) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">{row.projectName}</td>
                      <td className="px-6 py-4 text-gray-600">{row.userName}</td>
                      <td className="px-6 py-4 text-right font-bold text-brand-600">{formatDuration(row.totalHours)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-400 italic">
                      No team project timing data available for today.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Activity Log */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            Detailed Activity Log (Today)
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 border ${showFilters ? 'bg-brand-50 text-brand-700 border-brand-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filter
            </button>
            <Badge variant="info">{filteredLogs.length} Sessions</Badge>
          </div>
        </div>
        
        {/* Filters Row */}
        {showFilters && (
          <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 text-sm animate-in slide-in-from-top-2">
            <select 
              value={filterEmployeeId}
              onChange={(e) => setFilterEmployeeId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-brand-200 outline-none focus:ring-2 focus:ring-brand-500 bg-white" 
            >
              <option value="">All Employees</option>
              {allUsers?.map((emp: any) => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
            <select 
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-brand-200 outline-none focus:ring-2 focus:ring-brand-500 bg-white" 
            >
              <option value="">All Projects</option>
              {allProjects?.map((proj: any) => (
                <option key={proj._id} value={proj._id}>{proj.name}</option>
              ))}
            </select>
            <select 
              value={filterTaskId}
              onChange={(e) => setFilterTaskId(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-lg border border-brand-200 outline-none focus:ring-2 focus:ring-brand-500 bg-white" 
            >
              <option value="">All Tasks</option>
              {allTasks?.map((task: any) => (
                <option key={task._id} value={task._id}>{task.workType}</option>
              ))}
            </select>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[10px] uppercase tracking-wider font-bold border-b border-gray-50">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Project</th>
                <th className="px-6 py-3">Task / Notes</th>
                <th className="px-6 py-3 text-center">Start</th>
                <th className="px-6 py-3 text-center">End</th>
                <th className="px-6 py-3 text-right">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-600">
              {logsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-48"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-100 rounded w-12 mx-auto"></div></td>
                    <td className="px-6 py-4 text-center"><div className="h-4 bg-gray-100 rounded w-12 mx-auto"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-4 bg-gray-100 rounded w-10 ml-auto"></div></td>
                  </tr>
                ))
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log: WorkLog) => (
                  <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{log.userId?.name}</td>
                    <td className="px-6 py-4">{log.projectId?.name}</td>
                    <td className="px-6 py-4 italic truncate max-w-xs">{log.taskId?.workType || log.notes || '—'}</td>
                    <td className="px-6 py-4 text-center tabular-nums">{formatTime(log.startTime)}</td>
                    <td className="px-6 py-4 text-center tabular-nums">{formatTime(log.endTime)}</td>
                    <td className="px-6 py-4 text-right font-bold text-emerald-600">{formatDuration(log.hours)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 italic">
                    {allLogs && (allLogs as WorkLog[]).length > 0 
                      ? "No activity matches your filters." 
                      : "No detailed task activity recorded for today."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
