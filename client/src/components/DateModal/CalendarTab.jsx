import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DAY_NAMES,
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isBeforeToday,
  isToday,
} from './dateUtils';

function CalendarTab({ sendAt, onSelect }) {
  const [viewMonth, setViewMonth] = useState(sendAt.getMonth());
  const [viewYear, setViewYear] = useState(sendAt.getFullYear());
  const [slideDirection, setSlideDirection] = useState(0);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const canGoPrev = viewYear > currentYear || (viewYear === currentYear && viewMonth > currentMonth);

  const goToPrevMonth = () => {
    if (!canGoPrev) return;
    setSlideDirection(-1);
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const goToNextMonth = () => {
    setSlideDirection(1);
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const gridVariants = {
    enter: (dir) => ({ x: dir * 60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir * -60, opacity: 0 }),
  };

  const gridTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  };

  return (
    <div className="px-4 pt-3 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={goToPrevMonth}
          disabled={!canGoPrev}
          className={`w-8 h-8 flex items-center justify-center rounded-full border-none outline-none transition-colors ${
            canGoPrev
              ? 'text-gray-600 hover:bg-gray-100 cursor-pointer'
              : 'text-gray-200 cursor-not-allowed'
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 4l-4 4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-primary select-none">
          {monthNames[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={goToNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full border-none outline-none text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((name, i) => (
          <div key={i} className="h-9 flex items-center justify-center text-xs text-gray-400 font-medium select-none">
            {name}
          </div>
        ))}
      </div>

      {/* Calendar grid with animation */}
      <div className="relative overflow-hidden" style={{ minHeight: '216px' }}>
        <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            custom={slideDirection}
            variants={gridVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={gridTransition}
            className="grid grid-cols-7"
          >
            {/* Leading empty cells */}
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="h-9 w-9" />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const isPast = isBeforeToday(date);
              const isTodayDate = isToday(date);
              const isDisabled = isPast || isTodayDate;
              const isSelected = isSameDay(date, sendAt);

              const baseCell = 'h-9 w-9 flex items-center justify-center text-sm border-none outline-none mx-auto';

              let stateClasses;
              if (isSelected && !isDisabled) {
                stateClasses = 'bg-[#2090FF] text-white rounded-full font-semibold cursor-pointer';
              } else if (isTodayDate) {
                stateClasses = 'bg-transparent font-bold text-gray-400 cursor-not-allowed';
              } else if (isPast) {
                stateClasses = 'bg-transparent text-gray-300 cursor-not-allowed';
              } else {
                stateClasses = 'bg-transparent text-gray-700 cursor-pointer hover:bg-blue-50 rounded-full';
              }

              const cellClasses = `${baseCell} ${stateClasses}`;

              return (
                <button
                  type="button"
                  key={day}
                  disabled={isDisabled}
                  onClick={() => {
                    if (!isDisabled) {
                      onSelect(new Date(viewYear, viewMonth, day));
                    }
                  }}
                  className={cellClasses}
                >
                  {day}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CalendarTab;
