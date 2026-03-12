import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [slideDirection, setSlideDirection] = useState(0);
  const [position, setPosition] = useState({ top: 0, left: 0, placement: 'below' });
  const [isMobile, setIsMobile] = useState(false);
  const tabBarRef = useRef(null);
  const overlayRef = useRef(null);
  const tabRefs = useRef({});

  const TAB_INDEX = { calendar: 0, presets: 1, custom: 2 };

  const handleTabChange = (tabId) => {
    const dir = TAB_INDEX[tabId] > TAB_INDEX[activeTab] ? 1 : -1;
    setSlideDirection(dir);
    setActiveTab(tabId);
  };

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

  // Update clip-path on active tab change — use getBoundingClientRect
  // for accuracy regardless of padding/nesting
  const updateClipPath = useCallback(() => {
    const container = overlayRef.current;
    const activeEl = tabRefs.current[activeTab];
    if (!container || !activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    const clipLeft = activeRect.left - containerRect.left;
    const clipRight = clipLeft + activeRect.width;
    const containerWidth = containerRect.width;

    const leftPct = (clipLeft / containerWidth) * 100;
    const rightPct = 100 - (clipRight / containerWidth) * 100;

    container.style.clipPath = `inset(0 ${rightPct.toFixed(1)}% 0 ${leftPct.toFixed(1)}% round 17px)`;
  }, [activeTab]);

  useEffect(() => {
    updateClipPath();
  }, [updateClipPath]);

  useEffect(() => {
    window.addEventListener('resize', updateClipPath);
    return () => window.removeEventListener('resize', updateClipPath);
  }, [updateClipPath]);

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

  const SLIDE_DISTANCE = 40;

  const tabContentVariants = prefersReducedMotion
    ? { enter: {}, center: {}, exit: {} }
    : {
        enter: (dir) => ({
          x: dir * SLIDE_DISTANCE,
          opacity: 0,
        }),
        center: {
          x: 0,
          opacity: 1,
        },
        exit: (dir) => ({
          x: dir * -SLIDE_DISTANCE,
          opacity: 0,
        }),
      };

  const tabContentTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.2, ease: [0.25, 1, 0.5, 1] };

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
        {/* Tab content area — fixed height prevents layout shift between tabs */}
        <div className="overflow-hidden" style={{ minHeight: 316 }}>
          <AnimatePresence mode="wait" initial={false} custom={slideDirection}>
            <motion.div
              key={activeTab}
              custom={slideDirection}
              variants={tabContentVariants}
              initial="enter"
              animate="center"
              exit="exit"
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

        {/* Tab bar at bottom — clip-path technique */}
        <div
          className="relative border-t border-gray-100"
          ref={tabBarRef}
          style={{ padding: '6px 6px' }}
        >
          {/* Base layer: default styling */}
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className="flex-1 py-2.5 text-xs font-medium border-none outline-none bg-transparent cursor-pointer text-gray-400 rounded-[14px] transition-colors hover:text-gray-600"
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overlay layer: active styling, revealed via clip-path */}
          <div
            ref={overlayRef}
            className="absolute flex gap-1 pointer-events-none"
            style={{
              top: 6,
              left: 6,
              right: 6,
              bottom: 6,
              clipPath: 'inset(0 100% 0 0% round 14px)',
              transition: 'clip-path 0.25s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {TABS.map((tab) => (
              <div
                key={tab.id}
                className="flex-1 py-2.5 text-xs font-medium flex items-center justify-center text-white rounded-[14px]"
                style={{ backgroundColor: '#3B82F6' }}
              >
                {tab.label}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default DateModal;
