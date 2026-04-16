'use client';

import { WorkLog } from '@/types';
import EmptyState from '@/components/ui/EmptyState';
import { formatAppDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

interface Props {
  logs: WorkLog[];
  isAdmin: boolean;
}

export default function LogHistory({ logs, isAdmin }: Props) {
  if (!logs.length) {
    return <EmptyState title="No logs found" description="Start logging your work to see history here." />;
  }

  const formatDuration = (hours: number) => {
    if (!hours) return '0m';
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    if (m === 0 && hours > 0) return '< 1m';
    return `${m}m`;
  };

  // Group logs by date
  const grouped = logs.reduce((acc, log) => {
    const key = formatAppDate(log.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(log);
    return acc;
  }, {} as Record<string, WorkLog[]>);

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([dateKey, dayLogs]) => {
        const total = dayLogs.reduce((s, l) => s + l.hours, 0);
        return (
          <div key={dateKey}>
            {/* Date header */}
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-700">
                {dateKey}
              </h3>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            {/* Log entries */}
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {isAdmin && <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Employee</th>}
                    <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Project</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Work Type</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Description</th>
                    <th className="text-right font-medium text-gray-500 px-4 py-2.5 text-xs">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {dayLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                      {isAdmin && (
                        <td className="px-4 py-3 text-gray-700 font-medium">
                          {(log.userId as any)?.name ?? '—'}
                        </td>
                      )}
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                        {(log.projectId as any)?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate">
                        {(log.taskId as any)?.workType ?? 'General Task'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate" title={log.notes || (log.taskId as any)?.description}>
                        {log.notes || (log.taskId as any)?.description || '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatDuration(log.hours)}
                      </td>
                    </tr>
                  ))}
                </tbody>              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}