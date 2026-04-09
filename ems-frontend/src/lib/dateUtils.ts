import { format } from 'date-fns';

/**
 * Standard date formatter for the application.
 * Returns date in DD/MM/YYYY format.
 * 
 * @param date - Date to format (string, Date, or undefined)
 * @returns Formatted date string or '-' if input is invalid
 */
export function formatAppDate(date?: string | Date | null): string {
  if (!date) return '—';
  
  try {
    const d = new Date(date);
    // Check for "Invalid Date"
    if (isNaN(d.getTime())) return '—';
    
    return format(d, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '—';
  }
}

/**
 * Standard relative date formatter (e.g., "3 days ago")
 * Placeholder for now, can be expanded if needed.
 */
export function formatRelativeDate(date?: string | Date | null): string {
  if (!date) return '—';
  // You could use formatDistanceToNow here if needed
  return formatAppDate(date); 
}
/**
 * Parses a DD/MM/YYYY string into a Date object.
 * Useful for handling manual text inputs that follow the app's date format.
 */
export function parseAppDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const [day, month, year] = dateStr.split('/').map(Number);
  if (!day || !month || !year) return null;
  
  const d = new Date(year, month - 1, day);
  return isNaN(d.getTime()) ? null : d;
}
