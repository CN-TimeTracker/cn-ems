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

const blank: any = { 
  name: '', email: '', password: '', role: UserRole.Dev,
  employeeCode: '', username: '', phoneNumber: '', dateOfBirth: '', gender: '', fatherName: '', currentAddress: '', permanentAddress: '', description: '',
  salary: '', bankName: '', accountNo: '', branchName: '', ifscCode: '', aadharNo: '', panNo: '', dateOfJoining: '',
  displayDateOfBirth: '', displayDateOfJoining: ''
};

const ROLE_OPTIONS = Object.values(UserRole).map((r) => ({ value: r, label: r }));
const GENDER_OPTIONS = [{value: '', label: 'Select Gender'}].concat(Object.values(Gender).map((g) => ({ value: g, label: g })));

export default function UserModal({ open, onClose, user }: Props) {
  const [form, setForm] = useState(blank);
  const [activeTab, setActiveTab] = useState<'basic' | 'personal' | 'account'>('basic');

  const { mutate: create, isPending: creating } = useCreateUser();
  const { mutate: update, isPending: updating } = useUpdateUser();
  const birthPickerRef = useRef<HTMLInputElement>(null);
  const joiningPickerRef = useRef<HTMLInputElement>(null);
  const isEditing = !!user;
  const isPending = creating || updating;

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
        dateOfJoining: user.dateOfJoining ? user.dateOfJoining.split('T')[0] : '',
        gender: user.gender || '',
        fatherName: user.fatherName || '',
        currentAddress: user.currentAddress || '',
        permanentAddress: user.permanentAddress || '',
        description: user.description || '',
        salary: user.salary || '',
        bankName: user.bankName || '',
        accountNo: user.accountNo || '',
        branchName: user.branchName || '',
        ifscCode: user.ifscCode || '',
        aadharNo: user.aadharNo || '',
        panNo: user.panNo || '',
        displayDateOfBirth: user.dateOfBirth ? formatAppDate(user.dateOfBirth) : '',
        displayDateOfJoining: user.dateOfJoining ? formatAppDate(user.dateOfJoining) : '',
      });
    } else {
      setForm(blank);
    }
    setActiveTab('basic');
  }, [user, open]);

  const set = (field: string, value: string) => setForm((f: any) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Map form data and convert numerics
    const payload = { ...form };
    if (payload.email) payload.email = payload.email.trim().toLowerCase();
    if (!payload.password) delete payload.password;
    if (payload.salary) payload.salary = Number(payload.salary);
    else delete payload.salary;
    
    // Clear out empty strings
    Object.keys(payload).forEach(k => {
      if (payload[k] === '') delete payload[k];
    });

    if (isEditing) {
      update({ id: user._id, input: payload }, { onSuccess: onClose });
    } else {
      create(payload as any, { onSuccess: onClose });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Edit member' : 'Add new member'}>
      <form onSubmit={handleSubmit} className="flex flex-col h-[80vh] max-h-[800px]">
        {/* TABS */}
        <div className="flex border-b border-gray-100 px-6 pt-2 bg-gray-50 shrink-0">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'personal', label: 'Personal Details' },
            { id: 'account', label: 'Account Details' },
          ].map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id as any)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${activeTab === t.id ? 'border-brand-500 text-brand-600 bg-white rounded-t-lg' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* SCROLLABLE content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          
          {activeTab === 'basic' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" required placeholder="e.g. John Doe" value={form.name} onChange={(e) => set('name', e.target.value)} />
                <Input label="User Name" placeholder="e.g. jdoe99" value={form.username} onChange={(e) => set('username', e.target.value)} />
                <Input label="Email Address" type="email" required placeholder="e.g. john@codeneptune.com" value={form.email} onChange={(e) => set('email', e.target.value)} disabled={isEditing} />
                <Input label="Employee Code" placeholder="e.g. EMP-001" value={form.employeeCode} onChange={(e) => set('employeeCode', e.target.value)} />
                <div className="relative">
                  <Input 
                    label="Date of Joining (DD/MM/YYYY)" 
                    type="text" 
                    placeholder="DD/MM/YYYY"
                    value={form.displayDateOfJoining} 
                    onChange={(e) => {
                      const val = e.target.value;
                      set('displayDateOfJoining', val);
                      const parsed = parseAppDate(val);
                      if (parsed) set('dateOfJoining', format(parsed, 'yyyy-MM-dd'));
                    }} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => joiningPickerRef.current?.showPicker()}
                    className="absolute right-2 top-8 p-1 text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                  <input
                    ref={joiningPickerRef}
                    type="date"
                    className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const d = new Date(val);
                      setForm(f => ({
                        ...f,
                        dateOfJoining: val,
                        displayDateOfJoining: format(d, 'dd/MM/yyyy')
                      }));
                    }}
                  />
                </div>
                <Select label="Role" value={form.role} onChange={(e) => set('role', e.target.value)} options={ROLE_OPTIONS} />
                {!isEditing && <Input label="Initial Password" type="password" required placeholder="••••••••" value={form.password} onChange={(e) => set('password', e.target.value)} />}
                {isEditing && <Input label="New Password (optional)" type="password" placeholder="Leave blank to keep current" value={form.password} onChange={(e) => set('password', e.target.value)} />}
              </div>
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Phone Number" placeholder="+91 9876543210" value={form.phoneNumber} onChange={(e) => set('phoneNumber', e.target.value)} />
                <Input label="Father's Name" placeholder="Father's Name" value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} />
                <div className="relative">
                  <Input 
                    label="Date of Birth (DD/MM/YYYY)" 
                    type="text" 
                    placeholder="DD/MM/YYYY"
                    value={form.displayDateOfBirth} 
                    onChange={(e) => {
                      const val = e.target.value;
                      set('displayDateOfBirth', val);
                      const parsed = parseAppDate(val);
                      if (parsed) set('dateOfBirth', format(parsed, 'yyyy-MM-dd'));
                    }} 
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => birthPickerRef.current?.showPicker()}
                    className="absolute right-2 top-8 p-1 text-gray-400 hover:text-brand-600 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" />
                  </button>
                  <input
                    ref={birthPickerRef}
                    type="date"
                    className="absolute inset-0 w-0 h-0 opacity-0 pointer-events-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      const d = new Date(val);
                      setForm(f => ({
                        ...f,
                        dateOfBirth: val,
                        displayDateOfBirth: format(d, 'dd/MM/yyyy')
                      }));
                    }}
                  />
                </div>
                <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value)} options={GENDER_OPTIONS} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Current Address</label>
                <textarea rows={2} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={form.currentAddress} onChange={(e) => set('currentAddress', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Permanent Address</label>
                <textarea rows={2} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={form.permanentAddress} onChange={(e) => set('permanentAddress', e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Describe Yourself</label>
                <textarea rows={3} className="w-full text-sm p-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-brand-500" value={form.description} onChange={(e) => set('description', e.target.value)} />
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Salary (per month)" type="number" placeholder="50000" value={form.salary} onChange={(e) => set('salary', e.target.value)} />
                <Input label="Bank Name" placeholder="HDFC, SBI, etc." value={form.bankName} onChange={(e) => set('bankName', e.target.value)} />
                <Input label="Account No" placeholder="123456789" value={form.accountNo} onChange={(e) => set('accountNo', e.target.value)} />
                <Input label="Branch Name" placeholder="e.g. MG Road Branch" value={form.branchName} onChange={(e) => set('branchName', e.target.value)} />
                <Input label="IFSC Code" placeholder="e.g. HDFC0001234" value={form.ifscCode} onChange={(e) => set('ifscCode', e.target.value)} />
                <Input label="Aadhar No" placeholder="1234 5678 9012" value={form.aadharNo} onChange={(e) => set('aadharNo', e.target.value)} />
                <Input label="PAN No" placeholder="ABCDE1234F" value={form.panNo} onChange={(e) => set('panNo', e.target.value)} />
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3 shrink-0">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isPending} className="btn-primary flex-1 justify-center">
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isEditing ? 'Save Changes' : 'Create Member'}
          </button>
        </div>
      </form>
    </Modal>
  );
}