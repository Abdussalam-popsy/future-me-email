import { useState, useEffect } from 'react';
import ScrollWheel from './ScrollWheel';
import { MONTH_NAMES, getDaysInMonth, clampDate } from './dateUtils';

function ScrollPickerTab({ sendAt, onSelect }) {
  const [selectedDay, setSelectedDay] = useState(sendAt.getDate());
  const [selectedMonth, setSelectedMonth] = useState(sendAt.getMonth());
  const [selectedYear, setSelectedYear] = useState(sendAt.getFullYear());

  const currentYear = new Date().getFullYear();

  // Build items arrays
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const dayItems = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthItems = MONTH_NAMES.map((name, i) => ({ value: i, label: name }));
  const yearItems = Array.from({ length: 31 }, (_, i) => currentYear + i);

  // Auto-correct day if it exceeds days in current month
  useEffect(() => {
    if (selectedDay > daysInMonth) {
      setSelectedDay(daysInMonth);
    }
  }, [selectedMonth, selectedYear, daysInMonth, selectedDay]);

  const handleSelectDate = () => {
    const raw = new Date(selectedYear, selectedMonth, selectedDay);
    const clamped = clampDate(raw);
    onSelect(clamped);
  };

  return (
    <div className="px-4 pt-3 pb-4">
      {/* Labels */}
      <div className="flex mb-1">
        <div className="flex-1 text-xs text-gray-400 text-center">Day</div>
        <div className="flex-1 text-xs text-gray-400 text-center">Month</div>
        <div className="flex-1 text-xs text-gray-400 text-center">Year</div>
      </div>

      {/* Scroll wheels with highlight band */}
      <div className="relative" style={{ height: 200 }}>
        {/* Highlight band */}
        <div
          className="absolute left-4 right-4 bg-gray-100 rounded-lg pointer-events-none"
          style={{
            height: 40,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 0,
          }}
        />

        {/* Three scroll wheels */}
        <div className="relative flex" style={{ zIndex: 1 }}>
          <div className="flex-1">
            <ScrollWheel
              items={dayItems}
              selected={selectedDay}
              onSelect={setSelectedDay}
            />
          </div>
          <div className="flex-1">
            <ScrollWheel
              items={monthItems}
              selected={selectedMonth}
              onSelect={setSelectedMonth}
            />
          </div>
          <div className="flex-1">
            <ScrollWheel
              items={yearItems}
              selected={selectedYear}
              onSelect={setSelectedYear}
            />
          </div>
        </div>
      </div>

      {/* Select button */}
      <button
        type="button"
        onClick={handleSelectDate}
        className="w-full mt-3 py-3 bg-primary-blue text-white rounded-full text-sm font-medium border-none outline-none cursor-pointer hover:opacity-90 transition-opacity"
      >
        Select date
      </button>
    </div>
  );
}

export default ScrollPickerTab;
