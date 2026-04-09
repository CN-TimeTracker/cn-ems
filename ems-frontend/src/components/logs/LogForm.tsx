'use client';

import { useState, useEffect, useRef } from 'react';
import { useCreateLog, useMyTasks, useAssignedProjects, useTodayHours } from '@/hooks';
import { Task } from '@/types';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { Loader2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { formatAppDate, parseAppDate } from '@/lib/dateUtils';
import { format } from 'date-fns';

interface Props { onClose: () => void; }

export default function LogForm({ onClose }: Props) {
  const { data: myTasks }   = useMyTasks();
  const { data: projects }  = useAssignedProjects();
  const { data: todayData } = useTodayHours();
  const { mutate: createLog, isPending } = useCreateLog();
  const datePickerRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    projectId: '', taskId: '', hours: '', notes: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    displayDate: formatAppDate(new Date())
  });

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);

  // Filter tasks by selected project
  useEffect(() => {
    if (form.projectId && myTasks) {
      setFilteredTasks(
        myTasks.filter((t) => (t.projectId as any)?._id === form.projectId)
      );
    } else {
      setFilteredTasks(myTasks ?? []);
    }
  }, [form.projectId, myTasks]);

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLog(
      { ...form, hours: parseFloat(form.hours), date: form.date },
      { onSuccess: onClose }
    );
  };

  const remaining = todayData?.remaining ?? 10;

  return (
    <Modal open onClose={onClose} title="Log work">
      {/* Today's progress */}
      <div className="mb-5 rounded-xl bg-brand-50 border border-brand-100 px-4 py-3 flex items-center gap-3">
        <Clock className="w-4 h-4 text-brand-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xs text-brand-600 font-medium">Today's progress</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-brand-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${Math.min(100, ((todayData?.hours ?? 0) / 10) * 100)}%` }}
              />
            </div>
            <span className="text-xs text-brand-700 font-semibold">{todayData?.hours ?? 0} / 10h</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Project"
          required
          placeholder="Select project"
          value={form.projectId}
          onChange={(e) => { set('projectId', e.target.value); set('taskId', ''); }}
          options={(projects ?? []).map((p) => ({ value: p._id, label: p.name }))}
        />

        <Select
          label="Task"
          required
          placeholder={form.projectId ? 'Select task' : 'Select a project first'}
          value={form.taskId}
          onChange={(e) => set('taskId', e.target.value)}
          disabled={!form.projectId}
          options={filteredTasks.map((t) => ({ value: t._id, label: t.workType }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`Hours (max ${remaining}h remaining)`}
            type="number" required
            min="0.5" max={remaining} step="0.5"
            placeholder="e.g. 3"
            value={form.hours}
            onChange={(e) => set('hours', e.target.value)}
          />
          <div className="relative">
            <Input
              label="Date (DD/MM/YYYY)"
              type="text" required
              placeholder="DD/MM/YYYY"
              value={form.displayDate}
              onChange={(e) => {
                const val = e.target.value;
                setForm(f => {
                  const updated = { ...f, displayDate: val };
                  const parsed = parseAppDate(val);
                  if (parsed) {
                    updated.date = format(parsed, 'yyyy-MM-dd');
                  }
                  return updated;
                });
              }}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => datePickerRef.current?.showPicker()}
              className="absolute right-2 top-8 p-1 text-gray-400 hover:text-primary transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <input
              ref={datePickerRef}
              type="date"
              className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const d = new Date(val);
                setForm(f => ({
                  ...f,
                  date: val,
                  displayDate: format(d, 'dd/MM/yyyy')
                }));
              }}
            />
          </div>
        </div>

        <Textarea
          label="Notes (optional)"
          placeholder="What did you work on?"
          value={form.notes}
          onChange={(e) => set('notes', e.target.value)}
        />

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isPending || !form.taskId} className="btn-primary flex-1 justify-center">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Log hours
          </button>
        </div>
      </form>
    </Modal>
  );
}