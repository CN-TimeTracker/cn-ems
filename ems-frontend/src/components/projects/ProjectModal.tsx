'use client';

import { useEffect, useState, useRef } from 'react';
import { useCreateProject, useUpdateProject, useActiveEmployees } from '@/hooks';
import { Project, User } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import { Loader2, UserPlus, X, Calendar as CalendarIcon } from 'lucide-react';
import { ProjectStatus } from '@/types';
import { format } from 'date-fns';

import { formatAppDate, parseAppDate } from '@/lib/dateUtils';

interface Props {
  open: boolean;
  onClose: () => void;
  project?: Project | null;
}

type ProjectForm = {
  name: string;
  clientName: string;
  category: string;
  description: string;
  startDate: string;
  displayStartDate: string;
  deadline: string;
  status: ProjectStatus;
  allocatedHours: number;
  assignedTo: string[];
};

const blank: ProjectForm = {
  name: '',
  clientName: '',
  category: 'Product',
  description: '',
  startDate: format(new Date(), 'yyyy-MM-dd'),
  displayStartDate: formatAppDate(new Date()),
  deadline: '',
  status: ProjectStatus.Active,
  allocatedHours: 0,
  assignedTo: [],
};

export default function ProjectModal({ open, onClose, project }: Props) {
  const [form, setForm] = useState<ProjectForm>(blank);
  const { data: employees } = useActiveEmployees();
  const { mutate: create, isPending: creating } = useCreateProject();
  const { mutate: update, isPending: updating }  = useUpdateProject();
  const startPickerRef = useRef<HTMLInputElement>(null);
  const isEditing = !!project;
  const isPending = creating || updating;

  useEffect(() => {
    if (project) {
      setForm({
        name:        project.name,
        clientName:  project.clientName,
        category:    project.category || 'Product',
        description: project.description ?? '',
        startDate:   format(new Date(project.startDate), 'yyyy-MM-dd'),
        deadline:    format(new Date(project.deadline),  'yyyy-MM-dd'),
        status:      project.status,
        allocatedHours: project.allocatedHours ?? 0,
        assignedTo: (project.assignedTo as any[])?.map(u => typeof u === 'string' ? u : u._id) ?? [],
        displayStartDate: formatAppDate(project.startDate)
      });
    } else {
      setForm({
        ...blank,
        startDate: format(new Date(), 'yyyy-MM-dd')
      });
    }
  }, [project, open]);

  const set = (field: keyof ProjectForm, value: any) =>
  setForm((f: ProjectForm) => {
    const updated = { ...f, [field]: value };

    if (field === 'startDate' || field === 'allocatedHours') {
      const start = updated.startDate ? new Date(updated.startDate) : new Date();
      const hours = updated.allocatedHours || 0;
      const daysRequired = Math.ceil(hours / 8);

      const calcDeadline = (startDate: Date, days: number): Date => {
        const date = new Date(startDate);
        let added = 0;
        while (added < days) {
          date.setDate(date.getDate() + 1);
          if (date.getDay() !== 0 && date.getDay() !== 6) added++;
        }
        return date;
      };

      updated.deadline = format(
        calcDeadline(start, Math.max(0, daysRequired - 1)),
        'yyyy-MM-dd'
      );
    }

    return updated;
  });

  const toggleAssignee = (userId: string) => {
    const current = [...form.assignedTo];
    if (current.includes(userId)) {
      set('assignedTo', current.filter(id => id !== userId));
    } else {
      set('assignedTo', [...current, userId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      update({ id: project._id, input: form }, { onSuccess: onClose });
    } else {
      create(form, { onSuccess: onClose });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit project' : 'New project'}>
      <form onSubmit={handleSubmit} className="space-y-4 p-10">
        <Input label="Project name" required placeholder="e.g. Neptune CRM"
          value={form.name} onChange={(e) => set('name', e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <Input label="Client name" required placeholder="e.g. TechCorp Ltd"
            value={form.clientName} onChange={(e) => set('clientName', e.target.value)} />
          
          <Select 
            label="Category" 
            required
            options={[
              { value: 'Custom Product', label: 'Custom Product' },
              { value: 'Support',        label: 'Support' },
              { value: 'Product',        label: 'Product' },
            ]}
            value={form.category} 
            onChange={(e) => set('category', e.target.value)} 
          />
        </div>

        <Textarea label="Description (optional)" placeholder="Brief project description..."
          value={form.description} onChange={(e) => set('description', e.target.value)} />

        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <Input 
              label="Start date (DD/MM/YYYY)" 
              type="text" 
              required
              placeholder="DD/MM/YYYY"
              value={form.displayStartDate} 
              onChange={(e) => {
                const val = e.target.value;
                const parsed = parseAppDate(val);
                if (parsed) {
                  set('startDate', format(parsed, 'yyyy-MM-dd'));
                }
                set('displayStartDate', val);
              }} 
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => startPickerRef.current?.showPicker()}
              className="absolute right-2 top-8 p-1 text-gray-400 hover:text-brand-600 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
            <input
              ref={startPickerRef}
              type="date"
              className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
              onChange={(e) => {
                const val = e.target.value;
                if (!val) return;
                const d = new Date(val);
                setForm((f: ProjectForm) => ({
                  ...f,
                  startDate: val,
                  displayStartDate: format(d, 'dd/MM/yyyy')
                }));
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Calculated End Date</label>
            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 font-semibold h-[42px] flex items-center">
              {form.deadline ? formatAppDate(form.deadline) : '---'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Allocated Hours" type="number" required min="1"
            value={form.allocatedHours} onChange={(e) => set('allocatedHours', parseInt(e.target.value) || 0)} />
          {isEditing && (
            <Select label="Status"
              options={[
                { value: ProjectStatus.Active,    label: 'Active' },
                { value: ProjectStatus.Completed, label: 'Completed' },
              ]}
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            />
          )}
        </div>

        {/* Assignment */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-black text-[16px] flex items-center gap-1.5">
            <UserPlus className="w-4 h-4 text-black text-[16px]"  />
            Assign to Employees
          </label>
          <div className="border rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50/50">
            <div className="grid grid-cols-1 gap-2">
              {employees?.map((emp) => (
                <label key={emp._id} className="flex items-center gap-2 text-sm p-1 hover:bg-white rounded border border-transparent hover:border-gray-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4 shadow-sm"
                    checked={form.assignedTo.includes(emp._id)}
                    onChange={() => toggleAssignee(emp._id)}
                  />
                  <span className="font-medium text-gray-700">{emp.name}</span>
                  <span className="text-gray-400 text-xs italic">({emp.role})</span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-400">Calculated 8h/day excludes weekends. Assigned users can track time.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Save changes' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
