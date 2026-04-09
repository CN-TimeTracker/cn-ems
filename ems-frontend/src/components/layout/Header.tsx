'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { toggleSidebar } from '@/store/uiSlice';
import { useLogout } from '@/hooks';
import { Menu, LogOut, Bell, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { mutate: logout } = useLogout();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout(undefined, {
      onSuccess: () => router.replace('/login')
    });
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-all duration-200">
        
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:ring-2 focus:ring-brand-500/20 md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          
          {/* Notifications */}
          <button className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-100 mx-2 hidden sm:block"></div>

          {/* User profile */}
          <div className="flex items-center gap-3 pl-2 group cursor-default">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-gray-900 leading-tight">{user?.name}</p>
              <p className="text-xs text-brand-600 font-medium">{user?.role}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm border border-brand-100 transition-transform group-hover:scale-105 duration-200 overflow-hidden">
              {user?.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={user.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                user?.name?.charAt(0) || <UserIcon className="w-4 h-4" />
              )}
            </div>
          </div>

          {/* Logout */}
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
            className="ml-2 p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 active:scale-95"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

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
                className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
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