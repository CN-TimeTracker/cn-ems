import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  className?: string;
  variant?: 'emerald' | 'indigo' | 'sky' | 'rose' | 'amber';
  href?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  variant = 'indigo',
  className,
  href
}: StatsCardProps) {
  const CardContent = (
    <div className={cn(
      `relative overflow-hidden bg-gradient-to-br ${variantStyles[variant]} p-4 rounded-2xl text-white shadow-lg transition-all duration-300 hover:scale-[1.03] hover:brightness-110 group cursor-pointer`,
      className
    )}>
      {/* Glassmorphism Background elements */}
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
      
      <div className="relative flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1 truncate">
            {title}
          </p>
          <p className="text-2xl font-black tracking-tighter truncate leading-none">
            {value}
          </p>
          {description && (
            <p className="text-[10px] font-bold opacity-60 mt-1.5 truncate">
              {description}
            </p>
          )}
        </div>

        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md border border-white/20 shadow-inner shrink-0 group-hover:rotate-12 transition-transform">
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{CardContent}</Link>;
  }

  return CardContent;
}

const variantStyles = {
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-100',
  indigo:  'from-indigo-500 to-purple-600 shadow-indigo-100',
  sky:     'from-sky-500 to-blue-600 shadow-sky-100',
  rose:    'from-rose-500 to-red-600 shadow-rose-100',
  amber:   'from-amber-500 to-orange-600 shadow-amber-100',
};
