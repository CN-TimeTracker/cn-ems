'use client';

import { useEffect, useState } from 'react';
import { useCreateTask, useUpdateTask, useActiveProjects, useAssignedProjects } from '@/hooks';
import { Task, TaskStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { formatAppDate } from '@/lib/dateUtils';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task | null;
}

const blank = {
  projectId: '', workType: '', description: '',
  status: TaskStatus.CurrentlyWorking,
};

const WORK_TYPE_OPTIONS = [
  { value: 'New Task', label: 'New Task' },
  { value: 'Client Changes', label: 'Client Changes' },
  { value: 'Issues', label: 'Issues' },
  { value: 'Client Feedback', label: 'Client Feedback' },
  { value: 'Support', label: 'Support' },
];

const STATUS_OPTIONS = Object.values(TaskStatus).map((s) => ({ value: s, label: s }));

export default function TaskModal({ open, onClose, task }: Props) {
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === 'Admin';

  const [form, setForm] = useState(blank);

  // Conditionally fetch projects based on role
  const { data: allProjects } = useActiveProjects();
  const { data: assignedProjects } = useAssignedProjects();
  const projects = isAdmin ? allProjects : assignedProjects;

  const { mutate: create, isPending: creating } = useCreateTask();
  const { mutate: update, isPending: updating } = useUpdateTask();

  const isEditing = !!task;
  const isPending = creating || updating;

  useEffect(() => {
    if (task) {
      setForm({
        projectId: (task.projectId as any)?._id ?? '',
        workType: task.workType ?? 'Development',
        description: task.description ?? '',
        status: task.status,
      });
    } else {
      setForm({
        ...blank,
        workType: 'Development'
      });
    }
  }, [task, open]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      update({ id: task._id, input: form }, { onSuccess: onClose });
    } else {
      create(form, { onSuccess: onClose });
    }
  };

  const currentDate = formatAppDate(new Date());
  const currentTime = format(new Date(), 'HH:mm');

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit task' : 'Create New task'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white-100 p-8 rounded-xl ">

        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="text" value={currentDate} disabled readOnly />
          <Input label="Time" type="time" value={currentTime} disabled readOnly />
        </div>

        <div className="grid grid-cols-1 gap-3">
          <Select
            label="Project" required
            placeholder="Select project"
            value={form.projectId}
            onChange={(e) => set('projectId', e.target.value)}
            options={(projects ?? []).map((p) => ({ value: p._id, label: p.name }))}
            disabled={isEditing && !isAdmin}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl border border-white-200">
          <Select
            label="Work Type"
            required
            value={form.workType}
            onChange={(e) => set('workType', e.target.value)}
            options={WORK_TYPE_OPTIONS}
          />

          <Select
            label="Status"
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
            options={STATUS_OPTIONS}
          />
        </div>

        <Textarea label="Description (What are you working on?)" placeholder="Task details..."
          value={form.description} onChange={(e) => set('description', e.target.value)} required />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
