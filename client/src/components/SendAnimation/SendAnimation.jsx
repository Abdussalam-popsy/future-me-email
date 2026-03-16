import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationInfo from './ConfirmationInfo';

// --- Hooks ---

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return mobile;
}

// --- Constants ---

const STEPS = {
  APPEAR: 0,    // Letter fades in centered
  INSERT: 1,    // Envelope rises, letter descends into it
  SEAL: 2,      // Flap closes, seal pops
  READY: 3,     // Brief hold, pulse, slot appears
  DROP: 4,      // Envelope drops through slot
  CONFIRM: 5,   // Info fades in
};

// Cumulative delays (ms) for each step transition
const SCHEDULE = [0, 700, 1600, 2300, 2800, 3700];

// --- Easing ---

const SMOOTH = [0.22, 1, 0.36, 1];
const GRAVITY = [0.55, 0.06, 0.68, 0.19];

// --- Main Component ---

function SendAnimation({ deliveryDate, onWriteAnother }) {
  const [step, setStep] = useState(STEPS.APPEAR);
  const reducedMotion = useReducedMotion();
  const mobile = useIsMobile();

  const W = mobile ? 180 : 240;  // envelope width
  const H = mobile ? 126 : 168;  // envelope height
  const OFFSET = 280;            // two-offset trick distance
  const STAGE_H = 360;           // stage height

  useEffect(() => {
    if (reducedMotion) {
      setStep(STEPS.CONFIRM);
      return;
    }
    const timers = SCHEDULE.slice(1).map((ms, i) =>
      setTimeout(() => setStep(i + 1), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [reducedMotion]);

  const done = step >= STEPS.CONFIRM;

  return (
    <div
      className="relative flex items-center justify-center mx-auto"
      style={{ width: W * 1.6, height: STAGE_H, overflow: 'hidden' }}
    >
      {/* ============ ENVELOPE ASSEMBLY ============ */}
      <AnimatePresence>
        {!done && (
          <motion.div
            key="envelope-assembly"
            className="absolute"
            style={{
              width: W,
              left: '50%',
              marginLeft: -W / 2,
              top: '40%',
              marginTop: -H / 2,
            }}
            // Outer wrapper: two-offset trick + drop
            initial={{ y: OFFSET }}
            animate={{
              y: step >= STEPS.DROP ? 400 : step >= STEPS.INSERT ? 0 : OFFSET,
            }}
            exit={{ opacity: 0 }}
            transition={{
              y: {
                duration: step >= STEPS.DROP ? 0.7 : 0.9,
                ease: step >= STEPS.DROP ? GRAVITY : SMOOTH,
              },
            }}
          >
            {/* --- LETTER (child of envelope wrapper for two-offset trick) --- */}
            <motion.div
              className="absolute left-1/2"
              style={{
                width: W * 0.75,
                marginLeft: -(W * 0.75) / 2,
                zIndex: 20,
                top: -H * 0.05,
              }}
              initial={{ y: -OFFSET }}
              animate={{
                y: step >= STEPS.INSERT ? 0 : -OFFSET,
              }}
              transition={{
                y: { duration: 0.9, ease: SMOOTH },
              }}
            >
              <div
                className="bg-white rounded-lg shadow-md border border-[#E8F0FE]"
                style={{ height: H * 0.6, padding: W * 0.08 }}
              >
                <div className="flex flex-col gap-2">
                  <div className="h-[3px] rounded-full bg-[#C0D8F0]" style={{ width: '40%' }} />
                  <div className="h-[3px] rounded-full bg-[#C0D8F0] opacity-60" style={{ width: '70%' }} />
                  <div className="h-[3px] rounded-full bg-[#C0D8F0] opacity-40" style={{ width: '55%' }} />
                  <div className="h-[3px] rounded-full bg-[#C0D8F0] opacity-30" style={{ width: '65%' }} />
                </div>
              </div>
            </motion.div>

            {/* --- ENVELOPE BODY --- */}
            <div className="relative" style={{ width: W, height: H }}>

              {/* Back panel */}
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  zIndex: 10,
                  background: 'linear-gradient(180deg, #4DA3FF 0%, #2188FF 40%)',
                }}
              />

              {/* Front pocket — covers the bottom, letter slides behind this */}
              <div
                className="absolute left-0 right-0 bottom-0 rounded-b-xl"
                style={{
                  height: '62%',
                  zIndex: 30,
                  background: 'linear-gradient(180deg, #2188FF 0%, #1B7AE8 100%)',
                  boxShadow: '0 -1px 4px rgba(0,0,0,0.08)',
                }}
              />

              {/* Front pocket V-detail (the triangle fold lines on front) */}
              <svg
                viewBox="0 0 240 168"
                fill="none"
                className="absolute inset-0 w-full h-full"
                style={{ zIndex: 31 }}
                preserveAspectRatio="none"
              >
                <path
                  d="M0 64L120 148L240 64"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>

              {/* --- FLAP (3D rotate) --- */}
              <div
                className="absolute left-0 right-0 top-0"
                style={{
                  zIndex: step >= STEPS.SEAL ? 40 : 5,
                  perspective: 800,
                  height: H * 0.45,
                }}
              >
                <motion.div
                  style={{
                    transformOrigin: 'top center',
                    transformStyle: 'preserve-3d',
                    width: '100%',
                    height: '100%',
                  }}
                  animate={{
                    rotateX: step >= STEPS.SEAL ? 0 : 180,
                  }}
                  transition={{
                    duration: 0.6,
                    ease: SMOOTH,
                  }}
                >
                  {/* Front face of flap (visible when closed — lighter blue) */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <svg viewBox={`0 0 ${W} ${H * 0.45}`} className="w-full h-full block">
                      <path
                        d={`M0 0 L${W / 2} ${H * 0.42} L${W} 0 Z`}
                        fill="#4DA3FF"
                      />
                      <path
                        d={`M0 0 L${W / 2} ${H * 0.42} L${W} 0`}
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                        fill="none"
                      />
                    </svg>
                  </div>

                  {/* Back face of flap (visible when open — darker blue) */}
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'rotateX(180deg)',
                    }}
                  >
                    <svg viewBox={`0 0 ${W} ${H * 0.45}`} className="w-full h-full block">
                      <path
                        d={`M0 0 L${W / 2} ${H * 0.42} L${W} 0 Z`}
                        fill="#1B7AE8"
                      />
                    </svg>
                  </div>
                </motion.div>
              </div>

              {/* --- WAX SEAL --- */}
              <motion.div
                className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center rounded-full"
                style={{
                  zIndex: 50,
                  width: W * 0.2,
                  height: W * 0.2,
                  bottom: '16%',
                  background: 'radial-gradient(circle at 40% 35%, #1a2550 0%, #0B1431 70%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                }}
                animate={{
                  scale: step >= STEPS.SEAL ? 1 : 0,
                  opacity: step >= STEPS.SEAL ? 1 : 0,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 18,
                  delay: step === STEPS.SEAL ? 0.35 : 0,
                }}
              >
                <motion.svg
                  width="16" height="16" viewBox="0 0 16 16" fill="none"
                  animate={{
                    opacity: step >= STEPS.SEAL ? 1 : 0,
                  }}
                  transition={{ delay: step === STEPS.SEAL ? 0.5 : 0, duration: 0.2 }}
                >
                  <path
                    d="M4 8L7 11L12 5"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.div>
            </div>

            {/* Scale pulse at READY step */}
            {step === STEPS.READY && (
              <motion.div
                className="absolute inset-0"
                style={{ zIndex: 0 }}
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============ MAIL SLOT ============ */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          width: W * 1.1,
          height: 14,
          bottom: STAGE_H * 0.15,
          zIndex: 50,
          borderRadius: 7,
          background: 'linear-gradient(180deg, #0a0f24 0%, #0B1431 100%)',
          boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.2)',
        }}
        animate={{
          opacity: step >= STEPS.READY && step < STEPS.CONFIRM ? 1 : 0,
          scaleX: step >= STEPS.READY ? 1 : 0.3,
        }}
        transition={{
          opacity: { duration: 0.3 },
          scaleX: { duration: 0.4, ease: SMOOTH },
        }}
      />

      {/* Ground plane — covers everything below the slot */}
      <div
        className="absolute left-0 right-0 bg-bg-light"
        style={{
          zIndex: 40,
          bottom: 0,
          height: STAGE_H * 0.15 + 2,
        }}
      />

      {/* ============ CONFIRMATION ============ */}
      <AnimatePresence>
        {done && (
          <motion.div
            key="confirm"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ConfirmationInfo
              deliveryDate={deliveryDate}
              onWriteAnother={onWriteAnother}
              visible={done}
              reducedMotion={reducedMotion}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SendAnimation;
