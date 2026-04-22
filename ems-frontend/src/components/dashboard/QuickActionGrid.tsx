'use client';

import { 
  UserPlus, 
  FileSearch, 
  LifeBuoy, 
  FileText, 
  CreditCard, 
  ShieldCheck,
  LucideIcon,
  Clock,
  CalendarClock,
  FolderKanban,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ActionItemProps {
  label: string;
  icon: LucideIcon;
  bgColor: string;
  iconColor: string;
  href: string;
}

function ActionItem({ label, icon: Icon, bgColor, iconColor, href }: ActionItemProps) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-2.5 p-4 rounded-3xl transition-all hover:bg-gray-50 active:scale-95">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", bgColor)}>
        <Icon className={cn("w-5 h-5", iconColor)} />
      </div>
      <span className="text-[10px] font-black text-[#1A2B48] uppercase tracking-tight text-center leading-tight">
        {label}
      </span>
    </Link>
  );
}

export default function QuickActionGrid({ isAdmin = false }: { isAdmin?: boolean }) {
  const adminActions: ActionItemProps[] = [
    { label: 'Add Employee', icon: UserPlus, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', href: '/users' },
    { label: 'View Requests', icon: FileSearch, bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600', href: '/profile-requests' },
    { label: 'Payments', icon: CreditCard, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', href: '/salary' },
  ];

  const employeeActions: ActionItemProps[] = [
    { label: 'Log Work', icon: Clock, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', href: '/tasks' },
    { label: 'Apply Leave', icon: CalendarClock, bgColor: 'bg-blue-50', iconColor: 'text-blue-600', href: '/leaves' },
    { label: 'My Profile', icon: User, bgColor: 'bg-indigo-50', iconColor: 'text-indigo-600', href: '/profile' },
    { label: 'Project List', icon: FolderKanban, bgColor: 'bg-sky-50', iconColor: 'text-sky-600', href: '/projects' },
    { label: 'Payslips', icon: CreditCard, bgColor: 'bg-emerald-50', iconColor: 'text-emerald-600', href: '/salary' },
  ];

  const actions = isAdmin ? adminActions : employeeActions;

  return (
    <div className="bg-white p-6 rounded-3xl border border-[#F3F4F6] shadow-card">
      <h3 className="text-[11px] font-black text-[#1A2B48] uppercase tracking-widest mb-6">Quick Actions</h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <ActionItem key={action.label} {...action} />
        ))}
      </div>
    </div>
  );
}

