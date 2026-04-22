'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import * as ProfileService from '@/services/profile.service';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { UserRole, ProfileUpdateRequestStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { Check, X, FileLock2, History, RotateCcw, ShieldAlert } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { useDispatch } from 'react-redux';
import { addToast } from '@/store/uiSlice';
import { formatAppDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

export default function ProfileApprovalsPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const router = useRouter();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [rejectingItem, setRejectingItem] = useState<{ id: string, name: string } | null>(null);

  if (currentUser && currentUser.role !== UserRole.Admin) {
    router.replace('/dashboard');
    return null;
  }

  // Pending Requests Query
  const { data: requests, isLoading: loadingPending } = useQuery({
    queryKey: ['profile-requests'],
    queryFn: ProfileService.getPendingRequests,
    enabled: activeTab === 'pending',
  });

  // History Query
  const { data: history, isLoading: loadingHistory } = useQuery({
    queryKey: ['profile-history'],
    queryFn: ProfileService.getReviewHistory,
    enabled: activeTab === 'history',
  });

  const approveMut = useMutation({
    mutationFn: ProfileService.approveRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-requests'] });
      queryClient.invalidateQueries({ queryKey: ['profile-history'] });
      dispatch(addToast({ type: 'success', message: 'Request approved successfully.' }));
    },
    onError: (err: Error) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const rejectMut = useMutation({
    mutationFn: ProfileService.rejectRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-requests'] });
      queryClient.invalidateQueries({ queryKey: ['profile-history'] });
      dispatch(addToast({ type: 'warning', message: 'Request rejected.' }));
    },
    onError: (err: Error) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const revokeMut = useMutation({
    mutationFn: ProfileService.revokeRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-history'] });
      dispatch(addToast({ type: 'success', message: 'Approval revoked and values restored.' }));
    },
    onError: (err: Error) => dispatch(addToast({ type: 'error', message: err.message })),
  });

  const isLoading = (activeTab === 'pending' && loadingPending) || (activeTab === 'history' && loadingHistory);
  const currentItems = activeTab === 'pending' ? (requests || []) : (history || []);

  const handleApprove = (id: string, name: string) => {
    approveMut.mutate(id);
  };

  const handleReject = (id: string, name: string) => {
    setRejectingItem({ id, name });
  };

  const confirmReject = () => {
    if (rejectingItem) {
      rejectMut.mutate(rejectingItem.id);
      setRejectingItem(null);
    }
  };

  const handleRevoke = (id: string, name: string) => {
    if (confirm(`Confirm: Revoke approval for ${name} and RESTORE their previous profile values?`)) {
      revokeMut.mutate(id);
    }
  };

  const formatKey = (k: string) => {
    return k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Profile Update Requests</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage employee profile change requests and history.</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === 'pending' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <FileLock2 className="w-4 h-4" /> Pending
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all",
              activeTab === 'history' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-20"><Spinner size="lg" /></div>
      ) : currentItems.length === 0 ? (
        <EmptyState 
          title={activeTab === 'pending' ? "All Caught Up" : "No History"} 
          description={activeTab === 'pending' ? "There are no pending profile update requests." : "No reviewed requests found."} 
        />
      ) : (
        <div className="grid gap-6">
          {currentItems.map((req: any) => (
            <div key={req._id} className={cn(
              "bg-white border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row transition-all",
              req.status === ProfileUpdateRequestStatus.Pending ? "border-gray-100" : "border-gray-50 opacity-95 hover:opacity-100"
            )}>
              <div className="bg-gray-50 md:w-64 p-6 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col items-center text-center justify-center">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-3xl mb-3 border-4 border-white shadow-sm ring-1 ring-gray-100">
                  {req.userId?.profilePicture ? (
                    <img src={req.userId.profilePicture} alt={req.userId.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{req.userId?.name?.charAt(0) || '?'}</span>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 leading-tight">{req.userId?.name}</h3>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">{req.userId?.employeeCode || 'No Code'}</p>
                
                {/* Status Badge */}
                <div className={cn(
                  "mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                  req.status === ProfileUpdateRequestStatus.Pending && "bg-yellow-50 text-yellow-700 border-yellow-100",
                  req.status === ProfileUpdateRequestStatus.Approved && "bg-green-50 text-green-700 border-green-100",
                  req.status === ProfileUpdateRequestStatus.Rejected && "bg-red-50 text-red-700 border-red-100",
                  req.status === ProfileUpdateRequestStatus.Revoked && "bg-gray-50 text-gray-700 border-gray-200",
                )}>
                  {req.status}
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileLock2 className="w-4 h-4 text-gray-400" />
                    Requested Changes
                  </h4>
                  <div className="bg-white border rounded-xl overflow-hidden mt-3 shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Field</th>
                          {req.status !== ProfileUpdateRequestStatus.Rejected && (
                             <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-widest">Original</th>
                          )}
                          <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-widest text-brand-600">New Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(req.requestedChanges).map(([key, value]) => {
                          if (!value) return null;
                          
                          // Format New Value
                          let displayValue = String(value);
                          if (key.toLowerCase().includes('date') && !isNaN(Date.parse(displayValue))) {
                            displayValue = formatAppDate(new Date(displayValue));
                          }

                          // Original Value (Check history if approved/revoked, use userId if pending)
                          let originalValue: any = 'N/A';
                          if (req.status === ProfileUpdateRequestStatus.Pending) {
                            originalValue = req.userId?.[key];
                          } else {
                            originalValue = req.previousValues?.[key];
                          }

                          if (originalValue && key.toLowerCase().includes('date') && !isNaN(Date.parse(String(originalValue)))) {
                            originalValue = formatAppDate(new Date(String(originalValue)));
                          }

                          return (
                            <tr key={key} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-3 font-semibold text-gray-600 bg-gray-50/30 w-1/4">
                                {formatKey(key)}
                              </td>
                              {req.status !== ProfileUpdateRequestStatus.Rejected && (
                                <td className="px-4 py-3 text-gray-400 italic">
                                  {originalValue ? String(originalValue) : 'Empty'}
                                </td>
                              )}
                              <td className="px-4 py-3 font-bold text-brand-700">
                                {displayValue}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-3 pt-6 border-t border-gray-50">
                  <span className="text-xs text-gray-400 mr-auto">
                    {req.status === ProfileUpdateRequestStatus.Pending 
                      ? `Requested on ${new Date(req.createdAt).toLocaleString()}`
                      : `Reviewed by ${req.reviewedBy?.name || 'Admin'} on ${new Date(req.reviewedAt).toLocaleString()}`}
                  </span>
                  
                  {req.status === ProfileUpdateRequestStatus.Pending ? (
                    <>
                      <button 
                        onClick={() => handleReject(req._id, req.userId?.name)}
                        disabled={rejectMut.isPending || approveMut.isPending}
                        className="btn-secondary text-red-600 border-red-100 hover:bg-red-50 transition-all font-bold"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button 
                        onClick={() => handleApprove(req._id, req.userId?.name)}
                        disabled={rejectMut.isPending || approveMut.isPending}
                        className="btn-primary shadow-lg shadow-brand-100"
                      >
                        <Check className="w-4 h-4" /> Approve & Apply
                      </button>
                    </>
                  ) : req.status === ProfileUpdateRequestStatus.Approved ? (
                    <button 
                      onClick={() => handleRevoke(req._id, req.userId?.name)}
                      disabled={revokeMut.isPending}
                      className="btn-secondary text-brand-600 border-brand-100 hover:bg-brand-50 transition-all font-bold gap-2"
                    >
                      {revokeMut.isPending ? <Spinner size="sm" /> : <RotateCcw className="w-4 h-4" />}
                      Revoke Approval
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest italic">
                       Finalized
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Reject Confirmation Modal */}
      <Modal 
        open={!!rejectingItem} 
        onClose={() => setRejectingItem(null)}
        title="Reject Profile Updates"
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 p-4 bg-red-50 rounded-2xl border border-red-100">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-900">Confirm Rejection</h4>
              <p className="text-sm text-red-700">Are you sure you want to reject the profile updates for <strong>{rejectingItem?.name}</strong>? This action will ignore all requested changes.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <button 
              onClick={confirmReject}
              disabled={rejectMut.isPending}
              className="w-full py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-100 flex items-center justify-center gap-2"
            >
              {rejectMut.isPending ? <Spinner size="sm" /> : <X className="w-4 h-4" />}
              Reject & Ignore Changes
            </button>
            <button 
              onClick={() => setRejectingItem(null)}
              className="w-full py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all font-bold"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
