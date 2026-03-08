import { forwardRef } from 'react';
import { formatPillDate } from './dateUtils';

const DatePill = forwardRef(({ sendAt, onClick }, ref) => (
  <button
    ref={ref}
    type="button"
    onClick={onClick}
    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium cursor-pointer border-none outline-none hover:bg-blue-200 transition-colors flex items-center gap-1.5"
  >
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="opacity-70">
      <rect x="2" y="3" width="12" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 7h12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 1v4M11 1v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
    <span>{formatPillDate(sendAt)}</span>
  </button>
));

DatePill.displayName = 'DatePill';
export default DatePill;
