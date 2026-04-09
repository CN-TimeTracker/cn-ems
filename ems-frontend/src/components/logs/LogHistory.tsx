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
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                total >= 8 ? 'bg-green-50 text-green-700' :
                total >= 4 ? 'bg-amber-50 text-amber-700' :
                'bg-red-50 text-red-700'
              )}>
                {total}h total
              </span>
            </div>

            {/* Log entries */}
            <div className="card p-0 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {isAdmin && <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Employee</th>}
                    <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Task</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Project</th>
                    <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Notes</th>
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
                      <td className="px-4 py-3 text-gray-900 font-medium max-w-[200px] truncate">
                        {(log.taskId as any)?.title ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">
                        {(log.projectId as any)?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">
                        {log.notes ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {log.hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}