import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'danger' | 'info' | 'default';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ 
  children, 
  variant = 'default',
  className 
}: BadgeProps) {
  const variants = {
    success: 'bg-green-50 text-green-700 border-green-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    error: 'bg-red-50 text-red-700 border-red-100',
    danger: 'bg-red-50 text-red-700 border-red-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
    default: 'bg-gray-50 text-gray-700 border-gray-100',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border transition-colors cursor-default',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
