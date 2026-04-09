import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  size?: 'sm' | 'md';
}

const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
};

const SIZES = {
  sm: 'py-1.5 px-3 text-xs',
  md: 'py-2 px-4 text-sm',
};

export default function Button({
  variant = 'primary', loading, size = 'md',
  children, className, disabled, ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(VARIANTS[variant], SIZES[size], className)}
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {children}
    </button>
  );
}