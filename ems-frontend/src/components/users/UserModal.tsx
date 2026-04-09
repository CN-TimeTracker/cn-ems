'use client';

import { useEffect, useState, useRef } from 'react';
import { useCreateUser, useUpdateUser } from '@/hooks';
import { User, UserRole, Gender } from '@/types';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { formatAppDate, parseAppDate } from '@/lib/dateUtils';
import { format } from 'date-fns';

interface Props {
  open: boolean;
  onClose: () => void;
  user?: User | null;
}

/* ---------------- FORM TYPE ---------------- */
type UserForm = {
  name: string;
  email: string;
  password?: string;
  role: UserRole;

  employeeCode: string;
  username: string;
  phoneNumber: string;

  dateOfBirth: string;
  displayDateOfBirth: string;

  dateOfJoining: string;
  displayDateOfJoining: string;

  gender: string;
  fatherName: string;
  currentAddress: string;
  permanentAddress: string;
  description: string;

  salary: string;
  bankName: string;
  accountNo: string;
  branchName: string;
  ifscCode: string;
  aadharNo: string;
  panNo: string;
};

/* ---------------- DEFAULT ---------------- */
const blank: UserForm = {
  name: '',
  email: '',
  password: '',
  role: UserRole.Dev,

  employeeCode: '',
  username: '',
  phoneNumber: '',

  dateOfBirth: '',
  displayDateOfBirth: '',

  dateOfJoining: '',
  displayDateOfJoining: '',

  gender: '',
  fatherName: '',
  currentAddress: '',
  permanentAddress: '',
  description: '',

  salary: '',
  bankName: '',
  accountNo: '',
  branchName: '',
  ifscCode: '',
  aadharNo: '',
  panNo: '',
};

const ROLE_OPTIONS = Object.values(UserRole).map((r) => ({
  value: r,
  label: r,
}));

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  ...Object.values(Gender).map((g) => ({
    value: g,
    label: g,
  })),
];

export default function UserModal({ open, onClose, user }: Props) {
  const [form, setForm] = useState<UserForm>(blank);
  const [activeTab, setActiveTab] = useState<'basic' | 'personal' | 'account'>('basic');

  const { mutate: create, isPending: creating } = useCreateUser();
  const { mutate: update, isPending: updating } = useUpdateUser();

  const birthPickerRef = useRef<HTMLInputElement>(null);
  const joiningPickerRef = useRef<HTMLInputElement>(null);

  const isEditing = !!user;
  const isPending = creating || updating;

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,

        employeeCode: user.employeeCode || '',
        username: user.username || '',
        phoneNumber: user.phoneNumber || '',

        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        displayDateOfBirth: user.dateOfBirth ? formatAppDate(user.dateOfBirth) : '',

        dateOfJoining: user.dateOfJoining ? user.dateOfJoining.split('T')[0] : '',
        displayDateOfJoining: user.dateOfJoining ? formatAppDate(user.dateOfJoining) : '',

        gender: user.gender || '',
        fatherName: user.fatherName || '',
        currentAddress: user.currentAddress || '',
        permanentAddress: user.permanentAddress || '',
        description: user.description || '',

        salary: user.salary ? String(user.salary) : '',
        bankName: user.bankName || '',
        accountNo: user.accountNo || '',
        branchName: user.branchName || '',
        ifscCode: user.ifscCode || '',
        aadharNo: user.aadharNo || '',
        panNo: user.panNo || '',
      });
    } else {
      setForm(blank);
    }

    setActiveTab('basic');
  }, [user, open]);

  /* ---------------- SETTER ---------------- */
  const set = <K extends keyof UserForm>(field: K, value: UserForm[K]) => {
    setForm((f: UserForm) => ({
      ...f,
      [field]: value,
    }));
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = { ...form };

    if (payload.email) payload.email = payload.email.trim().toLowerCase();
    if (!payload.password) delete payload.password;

    if (payload.salary) payload.salary = Number(payload.salary);
    else delete payload.salary;

    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') delete payload[k];
    });

    if (isEditing && user) {
      update({ id: user._id, input: payload }, { onSuccess: onClose });
    } else {
      create(payload, { onSuccess: onClose });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit member' : 'Add new member'}>
      <form onSubmit={handleSubmit} className="flex flex-col h-[80vh] max-h-[800px]">

        {/* TABS */}
        <div className="flex border-b px-6 pt-2 bg-gray-50">
          {['basic', 'personal', 'account'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t as any)}
              className={`px-4 py-3 ${activeTab === t ? 'border-b-2 border-brand-500' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {activeTab === 'basic' && (
            <>
              <Input label="Name" value={form.name} onChange={(e) => set('name', e.target.value)} />
              <Input label="Email" value={form.email} onChange={(e) => set('email', e.target.value)} />
            </>
          )}

          {activeTab === 'personal' && (
            <>
              <Input label="Phone" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} />
            </>
          )}

          {activeTab === 'account' && (
            <>
              <Input label="Salary" value={form.salary} onChange={(e) => set('salary', e.target.value)} />
            </>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t flex gap-3">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create'}
          </button>
        </div>

      </form>
    </Modal>
  );
}