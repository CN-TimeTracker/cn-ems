import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { User, Eye, MapPin, Mail, Briefcase, Hash } from 'lucide-react';

export default function ProfileSummaryCard() {
  const currentUser = useAppSelector(selectCurrentUser);

  if (!currentUser) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row items-stretch">
      {/* Avatar & Basic Identity */}
      <div className="bg-gray-50 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-gray-100 w-full md:w-64 shrink-0">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-2xl mb-4">
            {currentUser.name.charAt(0)}
          </div>
          <h2 className="font-bold text-gray-900 leading-tight">{currentUser.name}</h2>
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-600 bg-brand-50 px-2 flex items-center justify-center py-1 mt-2 rounded">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
        <div className="flex items-start gap-3">
          <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Employee ID</p>
            <p className="font-medium text-gray-900">{currentUser.employeeCode || '—'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
            <Mail className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Email Address</p>
            <p className="font-medium text-gray-900 truncate">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
            <User className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Username</p>
            <p className="font-medium text-gray-900">{currentUser.username || '—'}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="bg-gray-50 p-2 rounded-lg text-gray-400">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">Location</p>
            <p className="font-medium text-gray-900 truncate">{currentUser.currentAddress || '—'}</p>
          </div>
        </div>
      </div>

      {/* Action Area */}
      <div className="bg-gray-50 p-6 border-t md:border-t-0 md:border-l border-gray-100 flex items-center justify-center md:w-32 shrink-0">
        <Link 
          href="/profile" 
          className="flex flex-col items-center gap-2 group text-gray-400 hover:text-brand-600 transition-colors"
          title="View Full Profile & Edit"
        >
          <div className="bg-white group-hover:bg-brand-50 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-gray-100 transition-colors">
            <Eye className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold uppercase">View</span>
        </Link>
      </div>
    </div>
  );
}
