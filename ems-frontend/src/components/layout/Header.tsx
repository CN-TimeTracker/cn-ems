'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { toggleSidebar } from '@/store/uiSlice';
import { useLogout } from '@/hooks';
import { Menu, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();

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

        </div>
      </header>
    </>
  );
}