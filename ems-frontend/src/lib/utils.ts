import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ─────────────────────────────────────────────
// cn — merge Tailwind classes safely
// Combines clsx (conditional classes) + twMerge
// (resolves conflicting Tailwind utilities)
//
// Usage:
//   cn('px-4 py-2', isActive && 'bg-brand-600', className)
// ─────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
