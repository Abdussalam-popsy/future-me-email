import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function TurnstileModal({ open, onSuccess, onClose }) {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [error, setError] = useState(false);
  const [exiting, setExiting] = useState(false);

  // Escape key closes modal
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // Render Turnstile widget into the container
  useEffect(() => {
    if (!open || !containerRef.current) return;

    const renderWidget = () => {
      if (!window.turnstile || !containerRef.current) return;

      // Clear any previous widget
      if (widgetId.current !== null) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }

      widgetId.current = window.turnstile.render(containerRef.current, {
        sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
        appearance: 'interaction-only',
        size: 'compact',
        theme: 'light',
        callback: (token) => {
          setError(false);
          // Play success exit animation, then call onSuccess
          setExiting(true);
          setTimeout(() => {
            setExiting(false);
            onSuccess(token);
          }, 300);
        },
        'error-callback': () => {
          setError(true);
        },
        'expired-callback': () => {
          setError(true);
        },
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }

    return () => {
      if (widgetId.current !== null && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, [open, onSuccess]);

  const handleRetry = useCallback(() => {
    setError(false);
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full mx-4 px-8 py-10 flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={exiting
              ? { opacity: 0, scale: 0.95 }
              : { opacity: 1, scale: 1 }
            }
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Envelope icon */}
            <span className="text-4xl mb-4" role="img" aria-label="envelope">
              ✉️
            </span>

            {/* Heading */}
            <h2 className="text-xl font-semibold text-primary mb-1 tracking-wide">
              One last thing
            </h2>

            {/* Subtext */}
            <p className="text-sm text-[#9198B2] mb-6 leading-relaxed">
              Just making sure you're human before your letter travels.
            </p>

            {/* Turnstile widget container */}
            <div ref={containerRef} className="flex justify-center min-h-[65px] mb-4" />

            {/* Error state */}
            {error && (
              <div className="flex flex-col items-center gap-2 mb-2">
                <p className="text-xs text-red-500">
                  Verification failed. Please try again.
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-xs text-primary-blue hover:underline bg-transparent border-none cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Footer */}
            <p className="text-[11px] text-[#9198B2]/60 mt-2">
              Secured by Cloudflare
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TurnstileModal;
