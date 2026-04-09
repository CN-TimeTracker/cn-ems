import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className
}: StatsCardProps) {
  return (
    <div className={cn(
      'bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md group',
      className
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center transition-transform group-hover:scale-110 duration-200">
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className={cn(
            'px-2 py-1 rounded-lg text-xs font-medium',
            trend.isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {description && (
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}
