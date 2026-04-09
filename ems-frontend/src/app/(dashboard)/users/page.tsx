'use client';

import { useState } from 'react';
import { 
  useAllUsers, 
  useDeactivateUser, 
  useActivateUser 
} from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole, User } from '@/types';
import { Plus, UserX, Pencil, UserCheck, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import UserModal from '@/components/users/UserModal';
import Modal from '@/components/ui/Modal';
import { formatAppDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

const ROLE_COLORS: Record<UserRole, 'default' | 'info' | 'success' | 'warning' | 'danger'> = {
  [UserRole.Admin]:    'danger',
  [UserRole.Dev]:      'info',
  [UserRole.Designer]: 'warning',
  [UserRole.SEO]:      'success',
  [UserRole.QA]:       'default',
  [UserRole.BA]:       'warning',
};

export default function UsersPage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const router = useRouter();

  // Redirect non-admins
  if (currentUser && currentUser.role !== UserRole.Admin) {
    router.replace('/dashboard');
    return null;
  }

  const { data: users, isLoading } = useAllUsers();
  const { mutate: deactivate, isPending: deactivating } = useDeactivateUser();
  const { mutate: activate, isPending: activating } = useActivateUser();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    type: 'activate' | 'deactivate';
    userId: string;
    userName: string;
  }>({
    open: false,
    type: 'deactivate',
    userId: '',
    userName: '',
  });

  const handleEdit = (user: User) => { setEditing(user); setModalOpen(true); };
  const handleClose = () => { setModalOpen(false); setEditing(null); };
  
  const triggerConfirm = (type: 'activate' | 'deactivate', userId: string, userName: string) => {
    setConfirmModal({ open: true, type, userId, userName });
  };

  const handleConfirmAction = () => {
    if (confirmModal.type === 'activate') {
      activate(confirmModal.userId, { onSuccess: () => setConfirmModal(prev => ({ ...prev, open: false })) });
    } else {
      deactivate(confirmModal.userId, { onSuccess: () => setConfirmModal(prev => ({ ...prev, open: false })) });
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const active   = users?.filter((u) => u.isActive) ?? [];
  const inactive = users?.filter((u) => !u.isActive) ?? [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="text-sm text-gray-500 mt-0.5">{active.length} active · {inactive.length} inactive</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {!users?.length ? (
        <EmptyState title="No users yet" description="Add your first team member." />
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left font-medium text-gray-500 px-6 py-3">Name</th>
                <th className="text-left font-medium text-gray-500 px-6 py-3">Email</th>
                <th className="text-left font-medium text-gray-500 px-6 py-3">Role</th>
                <th className="text-left font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left font-medium text-gray-500 px-6 py-3">Joined</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 text-gray-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <Badge variant={ROLE_COLORS[user.role]}>{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.isActive ? 'success' : 'default'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {formatAppDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleEdit(user)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      
                      {user._id !== currentUser?._id && (
                        user.isActive ? (
                          <button 
                            onClick={() => triggerConfirm('deactivate', user._id, user.name)}
                            title="Deactivate User"
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => triggerConfirm('activate', user._id, user.name)}
                            title="Activate User"
                            className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-500 transition-colors"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Edit/Add Modal */}
      <UserModal open={modalOpen} onClose={handleClose} user={editing} />

      {/* Confirmation Modal */}
      <Modal 
        open={confirmModal.open} 
        onClose={() => setConfirmModal(prev => ({ ...prev, open: false }))}
        title={confirmModal.type === 'activate' ? 'Reactivate Team Member' : 'Deactivate Team Member'}
        size="sm"
      >
        <div className="p-6 text-center">
          <div className={cn(
            "w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 shadow-sm",
            confirmModal.type === 'activate' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          )}>
            {confirmModal.type === 'activate' ? <UserCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          
          <h4 className="text-xl font-bold text-gray-900 mb-2">Are you sure?</h4>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            {confirmModal.type === 'activate' 
              ? `You are about to reactivate ${confirmModal.userName}. They will regain access to the platform immediately.`
              : `You are about to deactivate ${confirmModal.userName}. They will lose all access to the platform immediately.`
            }
          </p>

          <div className="flex gap-3">
            <button 
              onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmAction}
              disabled={deactivating || activating}
              className={cn(
                "btn-primary flex-1 justify-center shadow-lg",
                confirmModal.type === 'activate' ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-red-600 hover:bg-red-700 shadow-red-100"
              )}
            >
              {deactivating || activating ? <Spinner size="sm"  /> : (confirmModal.type === 'activate' ? 'Activate Now' : 'Deactivate Now')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}