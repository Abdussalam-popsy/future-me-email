import { useState, useEffect } from 'react';
import { formatShortDate, getNextBirthday, addToDate } from './dateUtils';

function PresetsTab({ onSelect }) {
  const [birthdayData, setBirthdayData] = useState(null);
  const [isEditingBirthday, setIsEditingBirthday] = useState(false);
  const [editMonth, setEditMonth] = useState(0);
  const [editDay, setEditDay] = useState(1);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('futureme_birthday');
      if (stored) {
        setBirthdayData(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const handleSaveBirthday = () => {
    const data = { month: editMonth, day: editDay };
    localStorage.setItem('futureme_birthday', JSON.stringify(data));
    setBirthdayData(data);
    setIsEditingBirthday(false);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const presets = [
    {
      label: 'On your birthday',
      getDate: () => birthdayData ? getNextBirthday(birthdayData.month, birthdayData.day) : null,
      isBirthday: true,
    },
    {
      label: 'A year from now',
      getDate: () => addToDate(new Date(), 1, 'year'),
    },
    {
      label: 'In 6 months',
      getDate: () => addToDate(new Date(), 6, 'month'),
    },
    {
      label: 'In a quarter',
      getDate: () => addToDate(new Date(), 3, 'month'),
    },
    {
      label: 'In a month',
      getDate: () => addToDate(new Date(), 1, 'month'),
    },
  ];

  return (
    <div className="py-2">
      {presets.map((preset, index) => {
        const date = preset.getDate();

        return (
          <div key={index}>
            <button
              type="button"
              onClick={() => {
                if (preset.isBirthday && !birthdayData) {
                  setIsEditingBirthday(true);
                  return;
                }
                if (date) {
                  onSelect(date);
                }
              }}
              className="w-full px-4 py-3 flex items-center justify-between border-none outline-none bg-transparent hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <span className="text-sm text-primary">{preset.label}</span>
              {preset.isBirthday && !birthdayData ? (
                <span className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  Set
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                    <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {date ? formatShortDate(date) : ''}
                  </span>
                  {preset.isBirthday && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (birthdayData) {
                          setEditMonth(birthdayData.month);
                          setEditDay(birthdayData.day);
                        }
                        setIsEditingBirthday((v) => !v);
                      }}
                      className="w-6 h-6 flex items-center justify-center rounded-full border-none outline-none bg-transparent text-gray-400 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                        <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </button>

            {/* Birthday inline editor */}
            {preset.isBirthday && isEditingBirthday && (
              <div className="px-4 pb-3 pt-1 flex items-center gap-2">
                <select
                  value={editMonth}
                  onChange={(e) => setEditMonth(parseInt(e.target.value))}
                  className="flex-1 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white text-primary cursor-pointer"
                >
                  {monthNames.map((name, i) => (
                    <option key={i} value={i}>{name}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={editDay}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 1 && val <= 31) {
                      setEditDay(val);
                    }
                  }}
                  className="w-16 px-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none bg-white text-primary text-center"
                />
                <button
                  type="button"
                  onClick={handleSaveBirthday}
                  className="px-3 py-1.5 text-sm font-medium bg-primary-blue text-white rounded-lg border-none outline-none cursor-pointer hover:opacity-90 transition-opacity"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PresetsTab;
