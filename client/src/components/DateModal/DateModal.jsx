import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarTab from './CalendarTab';
import PresetsTab from './PresetsTab';
import ScrollPickerTab from './ScrollPickerTab';

const TABS = [
  { id: 'calendar', label: 'Date' },
  { id: 'presets', label: 'Relative time' },
  { id: 'custom', label: 'Custom time' },
];

function DateModal({ sendAt, onSelect, onClose, anchorRef }) {
  const [activeTab, setActiveTab] = useState('calendar');
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' });
  const [isMobile, setIsMobile] = useState(false);

  // Calculate position from anchor
  const updatePosition = useCallback(() => {
    if (!anchorRef?.current) return;

    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);

    if (mobile) return; // Bottom sheet on mobile, no positioning needed

    const rect = anchorRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement = spaceBelow < 420 ? 'above' : 'below';

    setPosition({
      top: placement === 'below' ? rect.bottom + 8 : rect.top - 8,
      left: Math.min(rect.left, window.innerWidth - 336), // 320 + 16px margin
      placement,
    });
  }, [anchorRef]);

  useEffect(() => {
    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [updatePosition]);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Check prefers-reduced-motion
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const modalAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95, y: 8 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.97, y: 4 },
      };

  const modalTransition = prefersReducedMotion
    ? { duration: 0 }
    : {
        type: 'spring',
        stiffness: 280,
        damping: 24,
      };

  const exitTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.12, ease: 'easeOut' };

  const tabContentAnimation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 6 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 6 },
      };

  const tabContentTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.15, ease: 'easeOut' };

  const panelStyle = isMobile
    ? {}
    : position.placement === 'below'
      ? { position: 'fixed', top: position.top, left: position.left, zIndex: 50 }
      : { position: 'fixed', bottom: window.innerHeight - position.top, left: position.left, zIndex: 50 };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 40 }}
        onClick={onClose}
      />

      {/* Modal panel */}
      <motion.div
        {...modalAnimation}
        transition={modalTransition}
        exit={{ ...modalAnimation.exit, transition: exitTransition }}
        className={
          isMobile
            ? 'fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg'
            : 'bg-white rounded-2xl shadow-lg w-[320px]'
        }
        style={isMobile ? { zIndex: 50 } : panelStyle}
      >
        {/* Tab content area */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              {...tabContentAnimation}
              transition={tabContentTransition}
            >
              {activeTab === 'calendar' && (
                <CalendarTab sendAt={sendAt} onSelect={onSelect} />
              )}
              {activeTab === 'presets' && (
                <PresetsTab onSelect={onSelect} />
              )}
              {activeTab === 'custom' && (
                <ScrollPickerTab sendAt={sendAt} onSelect={onSelect} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Tab bar at bottom */}
        <div className="flex border-t border-gray-100">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-3 text-xs font-medium border-none outline-none bg-transparent cursor-pointer transition-colors ${
                  isActive
                    ? 'text-primary-blue border-t-2 border-primary-blue -mt-px'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                style={
                  isActive
                    ? { borderTopWidth: '2px', borderTopStyle: 'solid', borderTopColor: '#3B82F6', marginTop: '-1px' }
                    : {}
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

export default DateModal;
