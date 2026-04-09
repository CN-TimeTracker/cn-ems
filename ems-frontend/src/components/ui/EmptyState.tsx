import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl bg-white border border-dashed border-gray-200',
      className
    )}>
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-50 text-gray-400 mb-4 transition-transform hover:scale-105 duration-200">
          <Icon className="w-6 h-6" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      )}
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
