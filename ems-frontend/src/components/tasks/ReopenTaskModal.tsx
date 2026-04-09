'use client';

import { useState } from 'react';
import { useUpdateTask, useStartTimer } from '@/hooks';
import { Task, TaskStatus } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Loader2, RotateCw } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

const STATUS_OPTIONS = Object.values(TaskStatus)
  .filter(s => s !== TaskStatus.ProjectCompleted) // Can't reopen to "Completed"
  .map((s) => ({ value: s, label: s }));

export default function ReopenTaskModal({ open, onClose, task }: Props) {
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.CurrentlyWorking);

  const { mutate: update, isPending: updating } = useUpdateTask();
  const { mutate: startTimer, isPending: starting } = useStartTimer();

  const isPending = updating || starting;

  if (!task) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Update status
    update({ 
      id: task._id, 
      input: { status } 
    }, { 
      onSuccess: () => {
        // 2. Start timer
        startTimer(task._id, { 
          onSuccess: onClose 
        });
      } 
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Reopen Completed Task" size="md">
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl">
        
        <div className="flex items-center gap-3 p-4 bg-brand-50 rounded-xl border border-brand-100 mb-2">
            <RotateCw className="w-5 h-5 text-brand-600" />
            <p className="text-sm font-medium text-brand-700">
                Reopening records a new session for this task.
            </p>
        </div>

        {/* READ ONLY DETAILS */}
        <div className="space-y-4 opacity-70">
          <Input 
            label="Project" 
            value={(task.projectId as any)?.name ?? 'N/A'} 
            disabled 
            readOnly 
          />
          <Input 
            label="Work Type" 
            value={task.workType} 
            disabled 
            readOnly 
          />
          <Textarea 
            label="Original Description" 
            value={task.description} 
            disabled 
            readOnly 
            rows={2}
          />
        </div>

        <hr className="border-gray-100" />

        {/* EDITABLE STATUS */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-widest">
            Select New Status <span className="text-red-500">*</span>
          </label>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={STATUS_OPTIONS}
            required
            className="w-full"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isPending} 
            className="btn-primary flex-1 justify-center gap-2"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
            Reopen & Start Working
          </button>
        </div>
      </form>
    </Modal>
  );
}
