import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  '\u201CThe best time to write to your future self was a year ago. The second best time is now.\u201D',
  '\u201CWhat would you tell your future self today?\u201D',
  '\u201CYour future self is already grateful.\u201D',
];

const API_URL = import.meta.env.VITE_API_URL || 'https://futureme-worker.ayomidep745.workers.dev';

function AnimatedDigit({ digit, delay }) {
  const [displayDigit, setDisplayDigit] = useState(0);
  const target = parseInt(digit, 10);

  useEffect(() => {
    if (isNaN(target)) return;

    const startDelay = setTimeout(() => {
      let current = 0;
      const stepDuration = Math.max(30, 400 / (target + 1));

      const tick = () => {
        if (current >= target) {
          setDisplayDigit(target);
          return;
        }
        current += 1;
        setDisplayDigit(current);
        setTimeout(tick, stepDuration);
      };

      tick();
    }, delay);

    return () => clearTimeout(startDelay);
  }, [target, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay / 1000, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl shadow-sm flex items-center justify-center w-16 h-20 md:w-24 md:h-32"
    >
      <span className="text-5xl md:text-7xl font-semibold text-primary font-inter-tight">
        {displayDigit}
      </span>
    </motion.div>
  );
}

function RotatingQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUOTES.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-16 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="text-base text-[#9198B2] tracking-wide text-center max-w-[400px] italic font-inter-tight"
        >
          {QUOTES[index]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

function StatsPage() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then((data) => setTotal(data.total ?? 0))
      .catch(() => setTotal(0));
  }, []);

  const digits = total !== null ? String(total).split('') : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light px-4">
      <div className="w-full max-w-[630px] flex flex-col items-center gap-12">
        {/* Section 1 — Digit counter */}
        <div className="flex flex-col items-center gap-6">
          <p className="text-xs tracking-[0.2em] uppercase text-[#9198B2] font-inter-tight">
            Letters sent to the future
          </p>

          <div className="flex gap-3">
            {total === null ? (
              <div className="bg-white rounded-2xl shadow-sm flex items-center justify-center w-16 h-20 md:w-24 md:h-32">
                <span className="text-5xl md:text-7xl font-semibold text-primary font-inter-tight">
                  0
                </span>
              </div>
            ) : (
              digits.map((d, i) => (
                <AnimatedDigit key={i} digit={d} delay={i * 120} />
              ))
            )}
          </div>
        </div>

        {/* Section 2 — Rotating quote */}
        <RotatingQuote />

        {/* Section 3 — CTA */}
        <Link to="/" className="no-underline">
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="py-4 min-w-[240px] text-base font-medium border-none rounded-full text-white bg-[#2090FF] hover:bg-[#1878e0] cursor-pointer transition-colors font-inter-tight"
          >
            Write to your future self &rarr;
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

export default StatsPage;
