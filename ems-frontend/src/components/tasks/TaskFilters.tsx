'use client';

import { useActiveProjects, useActiveEmployees } from '@/hooks';
import { TaskStatus, TaskFilters as Filters } from '@/types';
import Select from '@/components/ui/Select';
import { X } from 'lucide-react';

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  isAdmin: boolean;
}

const STATUS_OPTIONS = Object.values(TaskStatus).map((s) => ({ value: s, label: s }));

export default function TaskFilters({ filters, onChange, isAdmin }: Props) {
  const { data: projects } = useActiveProjects();
  const { data: users }    = useActiveEmployees();

  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value || undefined });

  const hasActive = filters.projectId || filters.assignedTo || filters.status;

  return (
    <div className="card py-4">
      <div className="flex items-end gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <Select
            label="Project"
            placeholder="All projects"
            value={filters.projectId ?? ''}
            onChange={(e) => set('projectId', e.target.value)}
            options={(projects ?? []).map((p) => ({ value: p._id, label: p.name }))}
          />
        </div>

        {isAdmin && (
          <div className="flex-1 min-w-[160px]">
            <Select
              label="Assigned to"
              placeholder="All members"
              value={filters.assignedTo ?? ''}
              onChange={(e) => set('assignedTo', e.target.value)}
              options={(users ?? []).map((u) => ({ value: u._id, label: u.name }))}
            />
          </div>
        )}

        <div className="flex-1 min-w-[140px]">
          <Select
            label="Status"
            placeholder="All statuses"
            value={filters.status ?? ''}
            onChange={(e) => set('status', e.target.value as TaskStatus)}
            options={STATUS_OPTIONS}
          />
        </div>

        {hasActive && (
          <button
            onClick={() => onChange({})}
            className="btn-secondary flex items-center gap-1.5 self-end"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>
    </div>
  );
}