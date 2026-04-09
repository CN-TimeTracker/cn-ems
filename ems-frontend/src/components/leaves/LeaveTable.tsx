'use client';

import { useReviewLeave, useCancelLeave } from '@/hooks';
import { Leave, LeaveStatus } from '@/types';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Check, X } from 'lucide-react';
import { formatAppDate } from '@/lib/dateUtils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Props {
  leaves: Leave[];
  isAdmin: boolean;
}

const STATUS_BADGE: Record<LeaveStatus, 'warning' | 'success' | 'danger'> = {
  [LeaveStatus.Pending]:  'warning',
  [LeaveStatus.Approved]: 'success',
  [LeaveStatus.Rejected]: 'danger',
};

export default function LeaveTable({ leaves, isAdmin }: Props) {
  const { mutate: review }  = useReviewLeave();
  const { mutate: cancel }  = useCancelLeave();

  if (!leaves.length) {
    return <EmptyState title="No leave requests" description={isAdmin ? 'No leave requests have been submitted.' : 'You have no leave requests.'} />;
  }

  return (
    <div className="card p-0 overflow-hidden border border-gray-100 bg-white/80 shadow-md">
      <div className="overflow-x-auto max-w-full">
        <table className="w-full text-sm min-w-[800px]">
        <thead>
          <tr className="bg-[#4f46e5] border-b border-gray-100 text-white">
            {isAdmin && <th className="text-left font-bold text-black-500 px-12 py-4 text-xs uppercase tracking-wider">Employee</th>}
            <th className="text-left text-[15px] font-bold text-black-500 px-12 py-4 text-xs uppercase tracking-wider">Type</th>
            <th className="text-left text-[15px] font-bold text-black-500 px-12 py-4 text-xs uppercase tracking-wider">Duration</th>
            <th className="text-left text-[15px] font-bold text-black-500 px-12 py-4 text-xs uppercase tracking-wider">Dates</th>
            <th className="text-left text-[15px] font-bold text-black-500 px-12 py-4 text-xs uppercase tracking-wider">Reason</th>
            <th className="text-left text-[15px] font-bold text-black-500 px-12 py-4 text-xs uppercase tracking-wider">Status</th>
            <th className="text-left text-[15px] font-bold text-black-500 px-12 py-4 text-xs uppercase tracking-wider">Reviewed By</th>
            <th className="px-5 py-4" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {leaves.map((leave) => {
            const isHalfDay = leave.duration === 'Half Day';
            const days = isHalfDay ? 0.5 : (Math.round(
              (new Date(leave.endDate).getTime() - new Date(leave.startDate).getTime())
              / (1000 * 60 * 60 * 24)
            ) + 1);

            return (
              <tr key={leave._id} className="hover:bg-gray-50/50 items-center transition-colors group">
                {isAdmin && (
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900">{(leave.userId as any)?.name ?? '—'}</div>
                    <div className="text-[15px] text-gray-400 font-medium uppercase tracking-tight">{(leave.userId as any)?.role}</div>
                  </td>
                )}
                <td className="px-5 py-4">
                  <span className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                    leave.leaveType === 'Casual' ? "bg-purple-50 text-purple-700 border-purple-100" :
                    leave.leaveType === 'Sick' ? "bg-blue-50 text-blue-700 border-blue-100" :
                    "bg-orange-50 text-orange-700 border-orange-100"
                  )}>
                    {leave.leaveType}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm font-semibold text-[15px] text-black-700">{isHalfDay ? '0.5d' : `${days}d`}</div>
                  {isHalfDay && <div className="text-[15px] text-black-400 font-medium">{leave.halfDayType}</div>}
                </td>
                <td className="px-5 py-4 text-[15px] text-black-600 font-medium">
                  {formatAppDate(leave.startDate)}
                  {!isHalfDay && leave.startDate !== leave.endDate && (
                    <div className="text-[15px] text-gray-400 font-medium">to {formatAppDate(leave.endDate)}</div>
                  )}
                </td>
                <td className="px-5 py-4">
                  <p className="text-sm text-gray-500 max-w-[180px] truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
                    {leave.reason}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <Badge variant={STATUS_BADGE[leave.status]}>{leave.status}</Badge>
                </td>
                <td className="px-5 py-4 text-gray-400 text-xs">
                  {leave.reviewedBy
                    ? (
                      <div>
                        <div className="font-medium text-black text-[15px]">{(leave.reviewedBy as any)?.name}</div>
                        {/* <div>{format(new Date(leave.reviewedAt!), 'MMM d, yyyy')}</div> */}
                      </div>
                    )
                    : '—'
                  }
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/* Admin approve / reject */}
                    {isAdmin && leave.status === LeaveStatus.Pending && (
                      <>
                        <button
                          onClick={() => review({ id: leave._id, input: { status: LeaveStatus.Approved } })}
                          className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => review({ id: leave._id, input: { status: LeaveStatus.Rejected } })}
                          className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          title="Reject"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}

                    {/* Employee cancel */}
                    {!isAdmin && leave.status === LeaveStatus.Pending && (
                      <button
                        onClick={() => cancel(leave._id)}
                        className="text-xs text-red-500 hover:text-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}