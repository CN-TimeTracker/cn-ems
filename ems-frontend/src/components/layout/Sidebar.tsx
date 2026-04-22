'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { selectSidebarOpen, toggleSidebar } from '@/store/uiSlice';
import { UserRole } from '@/types';
import { useLogout } from '@/hooks';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  LayoutDashboard, FolderKanban, CheckSquare,
  Clock, Calendar, Users, ChevronLeft, ChevronRight, 
  UserCheck, User, CalendarDays, Wallet, FileLock2,
  Trophy, BarChart3, Bell, Settings, LogOut, HelpCircle, Activity, Heart
} from 'lucide-react';
import Image from 'next/image';
import logoImg from '@/asserts/cn_logo.webp';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  adminOnly?: boolean;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    groupName: 'Main Navigation',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    groupName: 'People',
    items: [
      { href: '/users', label: 'Employees', icon: Users, adminOnly: true },
      { href: '/attendance', label: 'Attendance', icon: UserCheck, adminOnly: true },
    ]
  },
  {
    groupName: 'Activity',
    items: [
      { href: '/projects', label: 'Projects', icon: FolderKanban },
      { href: '/tasks', label: 'Task List', icon: CheckSquare },
      { href: '/leaves', label: 'Leave Details', icon: Calendar },
      { href: '/events', label: 'Events', icon: CalendarDays },
      { href: '/work-logs', label: 'Work Logs', icon: Clock, adminOnly: true },
      { href: '/profile-requests', label: 'Approvals', icon: FileLock2, adminOnly: true },
    ]
  },
  {
    groupName: 'Account',
    items: [
      { href: '/profile', label: 'My Profile', icon: User },
    ]
  },
  {
    groupName: 'System',
    items: [
      { href: '/logout', label: 'Logout', icon: LogOut },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isOpen = useAppSelector(selectSidebarOpen);
  const isAdmin = user?.role === UserRole.Admin;
  const { mutate: logout } = useLogout();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => router.replace('/login')
    });
  };

  return (
    <>
    <aside className={cn(
      'flex flex-col bg-white border-r border-[#F3F4F6] transition-all duration-300 ease-in-out flex-shrink-0 relative z-40',
      isOpen ? 'w-[240px]' : 'w-[80px]'
    )}>
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-6 h-16 mb-4">
         <div className="flex items-center justify-center w-full mt-2">
            <Image 
              src={logoImg} 
              alt="Code Neptune" 
              className={cn("object-contain transition-all duration-300", isOpen ? "w-[150px]" : "w-[40px]")} 
              priority
            />
         </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-6 custom-scrollbar pb-10">
        {NAV_GROUPS.map((group) => {
          // Filter items based on roles
          const visibleItems = group.items.filter(item => !item.adminOnly || isAdmin);
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.groupName} className="space-y-1">
              {isOpen && (
                <p className="px-4 text-[10px] font-black uppercase tracking-widest text-[#8A92A6] mb-2">
                  {group.groupName}
                </p>
              )}
              {visibleItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link 
                    key={href} 
                    href={href === '/logout' ? '#' : href}
                    onClick={(e) => {
                      if (href === '/logout') {
                        e.preventDefault();
                        setShowLogoutConfirm(true);
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group relative',
                      active 
                        ? 'bg-[#EBF2FF] text-[#2563EB]' 
                        : 'text-[#8A92A6] hover:bg-[#F9FAFB] hover:text-[#1A2B48]'
                    )}
                  >
                    <Icon className={cn(
                      "w-[18px] h-[18px] flex-shrink-0 transition-colors",
                      active ? "text-[#2563EB]" : "text-[#8A92A6] group-hover:text-[#1A2B48]"
                    )} />
                    {isOpen && <span className="truncate">{label}</span>}
                    {active && isOpen && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#2563EB] rounded-l-full" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-[#F3F4F6] bg-white sticky bottom-0">
        <button 
          onClick={() => dispatch(toggleSidebar())}
          className="w-full flex items-center justify-center p-2 rounded-xl text-[#8A92A6] hover:bg-[#F9FAFB] hover:text-[#1A2B48] transition-all"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>

    {/* 🔴 Logout Confirmation Modal */}
    {showLogoutConfirm && (
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white rounded-2xl p-6 w-[320px] shadow-xl animate-in fade-in zoom-in-95">
          
          <h2 className="text-lg font-semibold mb-2">Confirm Logout</h2>
          <p className="text-sm text-gray-500 mb-4">
            Are you sure you want to logout?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowLogoutConfirm(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                setShowLogoutConfirm(false);
                handleLogout();
              }}
              className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 font-medium"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    )}
    </>
  );
}