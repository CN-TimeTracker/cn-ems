'use client';

import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectToasts, removeToast } from '@/store/uiSlice';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ToastContainer() {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none w-full max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => dispatch(removeToast(toast.id))} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: any; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  };

  const colors = {
    success: 'bg-green-50 border-green-100 text-green-800',
    error: 'bg-red-50 border-red-100 text-red-800',
    info: 'bg-blue-50 border-blue-100 text-blue-800',
    warning: 'bg-amber-50 border-amber-100 text-amber-800',
  };

  return (
    <div className={cn(
      'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-in fade-in slide-in-from-right-4 duration-300',
      colors[toast.type as keyof typeof colors]
    )}>
      <div className="flex-shrink-0 mt-0.5">
        {icons[toast.type as keyof typeof icons]}
      </div>
      <div className="flex-1 text-sm font-medium leading-5">
        {toast.message}
      </div>
      <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
