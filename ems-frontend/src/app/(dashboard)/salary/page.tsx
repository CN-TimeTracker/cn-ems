'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import Spinner from '@/components/ui/Spinner';
import Modal from '@/components/ui/Modal';
import { 
  ShieldCheck, Wallet, Landmark, CreditCard, 
  Fingerprint, Receipt, Download, 
  Users, Calendar, Filter, Pencil, CheckCircle, Clock
} from 'lucide-react';
import { UserRole, User } from '@/types';
import payslipService from '@/services/payslip.service';
import userService from '@/services/user.service';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';
import { useQuery } from '@tanstack/react-query';
import PayslipDocument from '@/components/salary/PayslipDocument';

const MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const YEARS = Array.from({ length: 5 }, (_, i) => ({
  value: (new Date().getFullYear() - i).toString(),
  label: (new Date().getFullYear() - i).toString(),
}));

export default function SalaryPage() {
  const dispatch = useDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isAdmin = currentUser?.role === UserRole.Admin;

  // Selection States
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  
  const isPastMonth = (m: string | number, y: string | number) => {
    if (m === 'all' || y === 'all') return true; // History view is always allowed
    const now = new Date();
    const curM = now.getMonth() + 1;
    const curY = now.getFullYear();
    const reqM = parseInt(m.toString());
    const reqY = parseInt(y.toString());

    if (reqY < curY) return true;
    if (reqY === curY && reqM < curM) return true;
    return false;
  };

  const isCurrentSelectionValid = isPastMonth(selectedMonth, selectedYear);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payslipData, setPayslipData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Overrides and Approvals
  const [editUser, setEditUser] = useState<User | null>(null);
  const [tempConfig, setTempConfig] = useState<{ month: number, year: number } | null>(null);
  const [overrideLop, setOverrideLop] = useState<number | string>('');

  // Queries
  const { data: employees, isLoading: isUsersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
    enabled: isAdmin,
  });

  const { data: salaryConfigs, refetch: refetchConfigs, isLoading: isAdminConfigsLoading } = useQuery({
    queryKey: ['salary-configs', selectedMonth, selectedYear, selectedEmployeeId],
    queryFn: () => payslipService.getAllConfigs({ 
      month: selectedMonth, 
      year: selectedYear, 
      userId: selectedEmployeeId 
    }),
    enabled: isAdmin,
  });

  const { data: userConfigs, refetch: refetchUserConfigs, isLoading: isUserConfigsLoading } = useQuery({
    queryKey: ['salary-configs-me'],
    queryFn: () => payslipService.getMyConfigs(),
    enabled: !!currentUser && !isAdmin,
  });

  if (!currentUser) return (
    <div className="flex justify-center p-20">
      <Spinner size="lg" />
    </div>
  );

  const handleGetPayslip = async (userId?: string, month?: number, year?: number) => {
    const reqMonth = month || parseInt(selectedMonth);
    const reqYear = year || parseInt(selectedYear);

    try {
      setIsGenerating(true);
      
      // Check for user-specific override if admin is requesting
      let leaveOverride: number | undefined;
      if (isAdmin && userId) {
        const config = salaryConfigs?.data?.find((c: any) => c.userId === userId);
        leaveOverride = config?.lopOverride;
      }

      const res = await payslipService.generate(
        reqMonth, 
        reqYear,
        userId,
        leaveOverride
      );
      
      if (res.success && res.data) {
        if (res.data.earnings.grossSalary === 0) {
          dispatch(addToast({ 
            type: 'error', 
            message: 'Gross Salary is not set for this user. Please update their profile first.' 
          }));
          return;
        }
        setPayslipData(res.data);
        setShowPreview(true);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to generate payslip';
      dispatch(addToast({ type: 'error', message }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser || !tempConfig) return;
    
    try {
      setIsProcessing(true);
      await payslipService.updateConfig({
        userId: editUser._id,
        month: tempConfig.month,
        year: tempConfig.year,
        lopOverride: overrideLop === '' ? undefined : Number(overrideLop),
      });
      dispatch(addToast({ type: 'success', message: 'Override updated successfully' }));
      setEditUser(null);
      setTempConfig(null);
      refetchConfigs();
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: 'Failed to update override' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApprove = async (userId: string, month: number, year: number, currentStatus: boolean) => {
    try {
      setIsProcessing(true);
      await payslipService.updateConfig({
        userId: userId,
        month,
        year,
        isApproved: !currentStatus,
      });
      dispatch(addToast({ 
        type: 'success', 
        message: currentStatus ? 'Approval revoked' : 'Payslip approved' 
      }));
      refetchConfigs();
    } catch (error: any) {
      dispatch(addToast({ type: 'error', message: 'Failed to update approval' }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      
      {/* Printable Area (Hidden on screen) */}
      {payslipData && (
        <div className="print-only">
           <PayslipDocument data={payslipData} />
        </div>
      )}

      {/* Preview Modal */}
      <Modal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        title="Payslip Preview"
        size="lg"
      >
        <div className="p-4 bg-gray-50 overflow-y-auto max-h-[70vh]">
          {payslipData && <PayslipDocument data={payslipData} />}
        </div>
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 no-print">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-8 py-3 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-brand-100 hover:bg-brand-500 active:scale-95"
          >
            <Download className="w-4 h-4" /> Print Payslip
          </button>
        </div>
      </Modal>

      {/* Edit Override Modal */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title={`Edit Month Payout: ${editUser?.name}`}
        size="md"
      >
        <form onSubmit={handleSaveConfig} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
              LOP Override (Days)
            </label>
            <input
              type="number"
              step="0.5"
              value={overrideLop}
              onChange={(e) => setOverrideLop(e.target.value)}
              placeholder="Leave empty to use dynamic calculation"
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 outline-none transition-all"
            />
            <p className="text-[10px] text-gray-400 font-medium italic">
              * This will overwrite the automatically calculated LOP days for {selectedMonth}/{selectedYear}.
            </p>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setEditUser(null)}
              className="flex-1 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="flex-1 px-6 py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-100 hover:bg-brand-500 transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? <Spinner size="sm" /> : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      <style jsx global>{`
        @media screen {
          .print-only { display: none !important; }
        }
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
        <div className="space-y-4">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 rounded-full font-bold text-xs uppercase tracking-widest border border-brand-100 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Financial Dashboard
          </div> */}
          <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-none">
            Compensation <span className="text-brand-600">&</span> Payouts
          </h1>
          <p className="text-gray-500 max-w-xl font-medium leading-relaxed">
            {isAdmin 
              ? 'Manage employee salaries, verify attendance, and authorize monthly payouts across the organization.'
              : 'Access your automated payslips, verify payout status, and monitor your fiscal timeline in one secure location.'}
          </p>
        </div>
        
        {/* <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-gray-200 border border-gray-100 flex items-center gap-6 min-w-[320px] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform">
            <Wallet className="w-48 h-48" />
          </div>
          <div className="p-5 bg-brand-600 rounded-3xl text-white shadow-xl shadow-brand-100">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 block">Monthly CTC</span>
            <span className="text-4xl font-black text-gray-900 tracking-tighter">
              {currentUser.salary ? `₹${(currentUser.salary * 1.075).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : '—'}
            </span>
          </div>
        </div> */}
      </div>

      {/* <div className="grid grid-cols-1 xl:grid-cols-12 gap-10"> */}
      <div className="flex flex-col gap-10">
        
        {/* Main Content Area */}
        <div className={isAdmin ? "xl:col-span-8 space-y-10" : "xl:col-span-12 space-y-10"}>
          
          {/* Table Section */}
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-10 py-8 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  {isAdmin ? <Users className="w-6 h-6 text-brand-600" /> : <Receipt className="w-6 h-6 text-brand-600" />}
                  {isAdmin ? 'Manage Employee Salaries' : 'My Payout History'}
                </h2>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1 italic">
                  {isAdmin ? 'Real-time Payout Records' : 'Instant access to your monthly statements'}
                </p>
              </div>
              
              {isAdmin && (
                <div className="flex items-center gap-4">
                  {showFilters && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                      {/* Employee Filter */}
                      <select 
                        value={selectedEmployeeId}
                        onChange={(e) => setSelectedEmployeeId(e.target.value)}
                        className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20 max-w-[150px]"
                      >
                        <option value="all">All Employees</option>
                        {employees?.map(emp => (
                          <option key={emp._id} value={emp._id}>{emp.name}</option>
                        ))}
                      </select>

                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="all">All Months</option>
                        {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                      <select 
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="bg-white border border-gray-200 rounded-2xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-brand-500/20"
                      >
                        <option value="all">All Years</option>
                        {YEARS.map(y => <option key={y.value} value={y.value}>{y.label}</option>)}
                      </select>
                    </div>
                  )}
                  <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-3 rounded-2xl border transition-all ${showFilters ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100' : 'bg-white border-gray-200 text-gray-400 hover:border-brand-500 hover:text-brand-600'}`}
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left bg-gray-50/50">
                    {isAdmin ? (
                      <>
                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee Name</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Month/Year</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                      </>
                    ) : (
                      <>
                        <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payout Period</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Base Payout</th>
                        <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                      </>
                    )}
                    <th className="px-10 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {isAdmin ? (
                    !isCurrentSelectionValid ? (
                      <tr>
                        <td colSpan={4} className="px-10 py-32 text-center group">
                           <div className="flex flex-col items-center gap-6 max-w-sm mx-auto">
                              <div className="p-8 bg-gray-50 rounded-[2.5rem] text-gray-300 group-hover:bg-brand-50 group-hover:text-brand-400 transition-all duration-700 scale-90 opacity-60">
                                <Clock className="w-16 h-16" />
                              </div>
                              <div className="space-y-2">
                                <h3 className="text-lg font-black text-gray-900 leading-none">Reporting in Progress</h3>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                                  {selectedMonth === 'all' ? 'Current' : MONTHS.find(m => m.value === selectedMonth)?.label} {selectedYear === 'all' ? '' : selectedYear} data will be available at the start of next month.
                                </p>
                              </div>
                           </div>
                        </td>
                      </tr>
                    ) : isAdminConfigsLoading || isUsersLoading ? (
                      <tr><td colSpan={4} className="px-10 py-20 text-center"><Spinner size="lg" /></td></tr>
                    ) : (selectedMonth !== 'all' && selectedYear !== 'all') ? (
                      // MONTHLY VIEW: Show all active employees for the selected period
                      employees?.filter(u => u.isActive).map(emp => {
                        const config = salaryConfigs?.data?.find((c: any) => c.userId?._id === emp._id || c.userId === emp._id);
                        const isApproved = config?.isApproved ?? false;

                        return (
                          <tr key={emp._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center font-bold text-brand-700 overflow-hidden">
                                    {emp.profilePicture ? (
                                      <img src={emp.profilePicture} alt={emp.name} className="w-full h-full object-cover" />
                                    ) : emp.name.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 leading-none">{emp.name}</span>
                                    <span className="text-[10px] font-mono text-gray-400 mt-1">{emp.employeeCode}</span>
                                  </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center font-black text-gray-500 text-xs tracking-widest">
                              {selectedMonth.padStart(2, '0')}/{selectedYear}
                            </td>
                            <td className="px-6 py-6 font-mono text-sm text-gray-500">
                               <div className="flex justify-center">
                                  {isApproved ? (
                                     <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                                     </div>
                                  ) : (
                                     <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" /> Pending
                                     </div>
                                  )}
                               </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => {
                                      setEditUser(emp);
                                      setTempConfig({ month: parseInt(selectedMonth), year: parseInt(selectedYear) });
                                      setOverrideLop(config?.lopOverride ?? '');
                                    }}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
                                    title="Edit Override"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleApprove(emp._id, parseInt(selectedMonth), parseInt(selectedYear), isApproved)}
                                    className={`p-3 rounded-2xl transition-all ${isApproved ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                    title={isApproved ? "Revoke Approval" : "Approve Payslip"}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>

                                  <button 
                                    disabled={isGenerating}
                                    onClick={() => handleGetPayslip(emp._id, parseInt(selectedMonth), parseInt(selectedYear))}
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-brand-50 hover:bg-brand-600 hover:text-white text-brand-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                  >
                                    <Download className="w-4 h-4" /> Payslip
                                  </button>
                               </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      // HISTORY VIEW: Show all records across all time
                      salaryConfigs?.data?.length === 0 ? (
                        <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No salary records found</td></tr>
                      ) : salaryConfigs?.data?.map((config: any) => {
                        const emp = config.userId;
                        const isApproved = config?.isApproved ?? false;

                        return (
                          <tr key={config._id} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-10 py-6">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center font-bold text-brand-700 overflow-hidden">
                                    {emp?.profilePicture ? (
                                      <img src={emp.profilePicture} alt={emp?.name} className="w-full h-full object-cover" />
                                    ) : emp?.name?.charAt(0)}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-bold text-gray-900 leading-none">{emp?.name || 'Unknown'}</span>
                                    <span className="text-[10px] font-mono text-gray-400 mt-1">{emp?.employeeCode || 'N/A'}</span>
                                  </div>
                              </div>
                            </td>
                            <td className="px-6 py-6 text-center font-black text-gray-500 text-xs tracking-widest">
                              {config.month.toString().padStart(2, '0')}/{config.year}
                            </td>
                            <td className="px-6 py-6 font-mono text-sm text-gray-500">
                               <div className="flex justify-center">
                                  {isApproved ? (
                                     <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                        <CheckCircle className="w-3.5 h-3.5" /> Approved
                                     </div>
                                  ) : (
                                     <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5" /> Pending
                                     </div>
                                  )}
                               </div>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button 
                                    onClick={() => {
                                      setEditUser(emp);
                                      setTempConfig({ month: config.month, year: config.year });
                                      setOverrideLop(config?.lopOverride ?? '');
                                    }}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
                                    title="Edit Override"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  
                                  <button 
                                    onClick={() => handleApprove(emp?._id || '', config.month, config.year, isApproved)}
                                    className={`p-3 rounded-2xl transition-all ${isApproved ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100' : 'bg-gray-50 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                    title={isApproved ? "Revoke Approval" : "Approve Payslip"}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>

                                  <button 
                                    disabled={isGenerating}
                                    onClick={() => handleGetPayslip(emp?._id, config.month, config.year)}
                                    className="inline-flex items-center gap-2 px-5 py-3 bg-brand-50 hover:bg-brand-600 hover:text-white text-brand-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                                  >
                                    <Download className="w-4 h-4" /> Payslip
                                  </button>
                               </div>
                            </td>
                          </tr>
                        );
                      })
                    )
                  ) : (
                    isUserConfigsLoading ? (
                      <tr><td colSpan={4} className="px-10 py-20 text-center"><Spinner size="lg" /></td></tr>
                    ) : userConfigs?.data?.length === 0 ? (
                      <tr><td colSpan={4} className="px-10 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">No payout records found</td></tr>
                    ) : userConfigs?.data?.map((config: any) => (
                      <tr key={config._id} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-10 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center font-bold text-brand-700">
                                <Calendar className="w-5 h-5" />
                              </div>
                              <span className="font-bold text-gray-900 uppercase tracking-widest text-xs">
                                {MONTHS.find(m => m.value === config.month.toString())?.label} {config.year}
                              </span>
                           </div>
                        </td>
                        <td className="px-6 py-6 text-center font-black text-gray-900 text-xs">
                           {currentUser.salary ? `₹${currentUser.salary.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="px-6 py-6 font-mono text-sm text-gray-500">
                             <div className="flex justify-center">
                                {config.isApproved ? (
                                   <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                      <CheckCircle className="w-3.5 h-3.5" /> Verified
                                   </div>
                                ) : (
                                   <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100 text-[10px] font-black uppercase tracking-widest">
                                      <Clock className="w-3.5 h-3.5" /> Processing
                                   </div>
                                )}
                             </div>
                        </td>
                        <td className="px-10 py-6 text-right">
                          <button 
                            disabled={isGenerating || !config.isApproved}
                            onClick={() => handleGetPayslip(undefined, config.month, config.year)}
                            className={`inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm active:scale-95 ${config.isApproved ? 'bg-brand-600 text-white hover:bg-brand-500' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          >
                            <Download className="w-4 h-4" /> {config.isApproved ? 'Get Payslip' : 'Restricted'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Bank Details Card (Updated Design) — ADMIN ONLY */}
          {/* {isAdmin && (
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-10 space-y-10 group hover:shadow-2xl transition-all duration-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <Landmark className="w-7 h-7 text-brand-600" />
                  Disbursement Account
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-black text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4" /> Secure Profile
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {[
                  { label: 'Bank Name', value: currentUser.bankName, icon: Landmark },
                  { label: 'Account Holder', value: currentUser.name, icon: Users },
                  { label: 'IFSC Code', value: currentUser.ifscCode, icon: Fingerprint, mono: true },
                  { label: 'Account Number', value: currentUser.accountNo, icon: CreditCard, mono: true },
                ].map((field, i) => (
                  <div key={i} className="space-y-3 group/field">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1 group-hover/field:text-gray-500 transition-colors flex items-center gap-2">
                        <field.icon className="w-3 h-3" /> {field.label}
                      </label>
                      <div className={`text-xl font-bold bg-gray-50/50 p-4 rounded-2xl border border-transparent group-hover/field:border-brand-100 group-hover/field:bg-white transition-all ${field.mono ? 'font-mono' : ''}`}>
                        {field.value || '—'}
                      </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>

        {/* Info & Side Action Area — ADMIN ONLY */}
        {/* {isAdmin && (
          <div className="xl:col-span-4 space-y-10">
             <div className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-sm space-y-8">
               <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Authorization Log
               </h4>
               
               <div className="space-y-6">
                  {[
                    { label: 'Approval Status', value: 'Manual per User', status: 'Required' },
                    { label: 'Lop Calculation', value: 'Auto + Overrides', status: 'System' },
                    { label: 'File Type', value: 'Dynamic PDF', status: 'Secure' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col border-l-4 border-brand-100 pl-5 py-1">
                       <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</span>
                       <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-gray-900">{item.value}</span>
                          <span className="text-[9px] font-black text-brand-600 bg-brand-50 px-2 py-1 rounded uppercase tracking-widest">{item.status}</span>
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          </div>
        )} */}

      </div>

    </div>
  );
}
