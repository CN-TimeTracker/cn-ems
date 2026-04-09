'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { selectSidebarOpen, toggleSidebar } from '@/store/uiSlice';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Clock, Calendar, Users, ChevronLeft, ChevronRight, UserCheck, User, CalendarDays, Wallet, FileLock2
} from 'lucide-react';

const NAV = [
  { href: '/dashboard',         label: 'Dashboard',         icon: LayoutDashboard, all: true },
  { href: '/tasks',             label: 'Task List',         icon: CheckSquare,     all: true },
  { href: '/leaves',            label: 'Leave Details',     icon: Calendar,        all: true },
  { href: '/projects',          label: 'Project List',      icon: FolderKanban,    all: true },
  { href: '/events',            label: 'Events',            icon: CalendarDays,    all: true },
  { href: '/salary',          label: 'Salary',            icon: Wallet,          all: true },
  { href: '/profile',           label: 'My Profile',        icon: User,            all: true },

  // Admin Only
  { href: '/work-logs',         label: 'Work Logs',         icon: Clock,           adminOnly: true },
  { href: '/attendance',        label: 'Attendance',        icon: UserCheck,       adminOnly: true },
  { href: '/users',             label: 'Users',             icon: Users,           adminOnly: true },
  { href: '/profile-requests',  label: 'Profile Approvals', icon: FileLock2,       adminOnly: true },
];

export default function Sidebar() {
  const pathname  = usePathname();
  const dispatch  = useAppDispatch();
  const user      = useAppSelector(selectCurrentUser);
  const isOpen    = useAppSelector(selectSidebarOpen);
  const isAdmin   = user?.role === UserRole.Admin;

  const links = NAV.filter((n) => n.all || (n.adminOnly && isAdmin));

  return (
    <aside className={cn(
      'flex flex-col bg-white border-r border-gray-100 transition-all duration-200 ease-in-out flex-shrink-0',
      isOpen ? 'w-56' : 'w-16'
    )}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">CN</span>
        </div>
        {isOpen && <span className="font-semibold text-gray-900 text-sm truncate">Code Neptune</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-0.5 px-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link key={href} href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              {isOpen && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-gray-100">
        <button onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
}