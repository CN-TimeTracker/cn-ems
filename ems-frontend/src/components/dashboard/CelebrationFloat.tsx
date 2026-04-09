'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Gift, PartyPopper, Cake, Heart, Sparkles } from 'lucide-react';
import dashboardService from '@/services/dashboard.service';
import Modal from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { formatAppDate } from '@/lib/dateUtils';

export default function CelebrationFloat() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch today's celebrations
  const { data: celebrations, isLoading } = useQuery({
    queryKey: ['celebrations'],
    queryFn: dashboardService.getCelebrations,
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });

  if (isLoading || !celebrations || celebrations.length === 0) return null;

  return (
    <>
      {/* Floating Gift Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-30 group"
      >
        <div className="relative">
          {/* Pulsing ring */}
          <div className="absolute inset-0 animate-ping bg-brand-400/30 rounded-full" />
          
          {/* Main button */}
          <div className="relative p-5 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-full shadow-2xl shadow-brand-200 text-white transform group-hover:scale-110 transition-all duration-300">
            <Gift className="w-8 h-8 animate-bounce" />
            
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 flex h-6 w-6">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-6 w-6 bg-pink-500 text-[10px] items-center justify-center font-bold">
                {celebrations.length}
              </span>
            </span>
          </div>

          {/* Decorative Sparkles */}
          <Sparkles className="absolute -top-4 -left-4 w-6 h-6 text-yellow-500 animate-pulse opacity-60" />
        </div>
      </button>

      {/* Celebration Modal */}
      <Modal 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        maxWidth="max-w-xl"
      >
        <div className="relative p-8 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-brand-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-pink-50 rounded-full blur-3xl opacity-50" />

          {/* Header */}
          <div className="relative text-center space-y-3 mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 text-brand-700 rounded-full font-bold text-xs uppercase tracking-widest border border-brand-100">
              <PartyPopper className="w-4 h-4" /> Celebration Time
            </div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Today's Special Moments</h2>
          </div>

          {/* Celebration List */}
          <div className="relative space-y-6">
            {celebrations.map((celebration: any) => (
              <div 
                key={celebration._id}
                className="group relative bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-100 transition-all duration-500"
              >
                <div className="flex items-center gap-6">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-2.5xl overflow-hidden ring-4 ring-gray-50 group-hover:ring-brand-100 transition-all">
                      {celebration.profilePicture ? (
                        <img 
                          src={celebration.profilePicture} 
                          alt={celebration.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold text-2xl uppercase">
                          {celebration.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    {/* Icon Badge */}
                    <div className={cn(
                      "absolute -bottom-2 -right-2 p-2 rounded-xl text-white shadow-lg",
                      celebration.type === 'Birthday' ? 'bg-pink-500' : 'bg-brand-500'
                    )}>
                      {celebration.type === 'Birthday' ? <Cake className="w-4 h-4" /> : <Heart className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-gray-900 leading-none mb-2 truncate">
                      {celebration.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                       <span className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                        {celebration.employeeCode}
                       </span>
                        <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                         {celebration.role}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100 italic">
                         {celebration.type === 'Birthday' ? 'Born on: ' : 'Joined on: '}
                         {formatAppDate(celebration.date)}
                        </span>
                     </div>
                  </div>
                </div>

                {/* Wishes */}
                <div className="mt-6 pt-6 border-t border-gray-50">
                  <p className="text-gray-600 italic font-medium leading-relaxed">
                    {celebration.type === 'Birthday' 
                      ? "Wishing you a day filled with laughter and joy! Happy Birthday! 🎉" 
                      : "Cheers to another year of excellence! Happy Work Anniversary! 🎊"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Close */}
          <div className="mt-10">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg"
            >
              Close and Celebrate
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
