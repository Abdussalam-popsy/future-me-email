import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DatePill from './components/DateModal/DatePill';
import DateModal from './components/DateModal/DateModal';
import LetterForm from './components/LetterForm';
import SubmitButton from './components/SubmitButton';
import ConfirmationScreen from './components/ConfirmationScreen';
import { useTurnstile } from './hooks/useTurnstile';
import { formatShortDate } from './components/DateModal/dateUtils';

function App() {
  const [form, setForm] = useState({
    to: '',
    subject: `A letter from ${formatShortDate(new Date())}`,
    message: '',
    signature: 'Keep Pushing,\nPast You',
  });
  const [buttonState, setButtonState] = useState('idle');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [sendAt, setSendAt] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pillRef = useRef(null);

  const [bannerDismissed, setBannerDismissed] = useState(() => {
    try {
      return localStorage.getItem('futureme_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    try {
      localStorage.setItem('futureme_banner_dismissed', 'true');
    } catch {
      // Safari private browsing may block localStorage writes
    }
  };

  const [errorMessage, setErrorMessage] = useState('');

  const { execute, reset } = useTurnstile();

  const handleChange = (e) => {
    setErrorMessage('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setButtonState('verifying');

    execute(async (token) => {
      // Handle Turnstile timeout (token is null)
      if (token === null) {
        setErrorMessage('Verification timed out. Please refresh and try again.');
        setButtonState('error');
        reset();
        setTimeout(() => setButtonState('idle'), 3000);
        return;
      }

      setButtonState('sending');

      const minimumDelay = new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const [res] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'https://futureme-worker.ayomidep745.workers.dev'}/schedule-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: form.to,
              subject: form.subject,
              message: `${form.message}\n\n${form.signature}`,
              sendAt: sendAt.toISOString(),
              cf_turnstile_response: token,
            }),
          }),
          minimumDelay
        ]);

        if (res.ok) {
          setButtonState('success');
          setDeliveryDate(sendAt);

          setTimeout(() => {
            setShowConfirmation(true);
          }, 1500);
        } else {
          let serverError = 'Something went wrong. Please try again.';
          try {
            const body = await res.json();
            if (body.error) serverError = body.error;
          } catch {
            // response wasn't JSON — use default message
          }
          setErrorMessage(serverError);
          setButtonState('error');
          reset();

          setTimeout(() => {
            setButtonState('idle');
          }, 3000);
        }
      } catch (err) {
        console.error('Error sending email:', err);
        setErrorMessage('Network error. Please check your connection and try again.');
        setButtonState('error');
        reset();

        setTimeout(() => {
          setButtonState('idle');
        }, 3000);
      }
    });
  };

  const handleWriteAnother = () => {
    setShowConfirmation(false);
    setDeliveryDate(null);
    setButtonState('idle');
    setForm({
      to: '',
      subject: `A letter from ${formatShortDate(new Date())}`,
      message: '',
      signature: 'Keep Pushing,\nPast You',
    });
    setSendAt(() => {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    });
    reset();
  };

  return (
    <>
      <AnimatePresence>
        {!bannerDismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-primary-blue text-white text-base font-medium py-2 text-center w-full relative tracking-wide"
          >
            You&apos;re early &mdash; Future Me just launched. Have feedback? &rarr;{' '}
            <a href="mailto:feedback@futureme.dev?subject=Hi%2C%20I%20have%20feedback%20for%20FutureMe" className="text-white/70 no-underline hover:text-white transition-colors">feedback@futureme.dev</a>
            <button
              onClick={handleDismissBanner}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-transparent border-none cursor-pointer text-lg leading-none"
              aria-label="Dismiss banner"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-screen flex flex-col items-center justify-center bg-bg-light px-4 overflow-hidden">
        <div className="w-full max-w-[630px]">
          <AnimatePresence>
            {!showConfirmation && (
              <motion.div
                initial={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className="text-3xl md:text-[40px] font-semibold text-black text-center mb-2 leading-[1.2] text-balance">
                  Write a letter to your future-self
                </h1>
                <p className="text-base text-[#9198B2] text-center mt-3 mb-8 tracking-wide">
                  Write what&apos;s on your mind. We&apos;ll email it to you when the time comes.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {showConfirmation ? (
            <ConfirmationScreen deliveryDate={deliveryDate} onWriteAnother={handleWriteAnother} />
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm mx-4 md:mx-0">
                <div className="flex flex-col gap-6 md:flex-row-reverse md:items-center md:justify-between mb-6">
                  {/* Date pill - Top Right */}
                  <DatePill
                    ref={pillRef}
                    sendAt={sendAt}
                    onClick={() => setIsModalOpen((o) => !o)}
                  />

                  {/* To Field */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-base text-[#9198B2] flex-shrink-0 tracking-wide">To:</span>
                    <input
                      type="email"
                      name="to"
                      placeholder="meinthefuture@gmail.com"
                      value={form.to}
                      onChange={handleChange}
                      required
                      className="min-w-0 w-full py-1 text-base border-none text-primary outline-none bg-transparent placeholder:text-[#9198B2] tracking-wide truncate focus:overflow-visible"
                    />
                  </div>
                </div>

                <LetterForm
                  form={form}
                  onFormChange={(name, value) => { setErrorMessage(''); setForm({ ...form, [name]: value }); }}
                />

                {/* Signature and button wrapper */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-6">
                  {/* Signature */}
                  <div className="mb-6 md:mb-0 md:flex-1">
                    <textarea
                      name="signature"
                      value={form.signature}
                      onChange={handleChange}
                      rows="2"
                      className="w-full py-2 text-lg tracking-widest leading-relaxed border-none text-[#9198B2] outline-none resize-none bg-transparent font-sacramento"
                    />
                  </div>

                  {/* Submit button */}
                  <SubmitButton buttonState={buttonState} disabled={buttonState !== 'idle'} />
                </div>

                {/* Error message */}
                {errorMessage && (
                  <p className="mt-3 text-xs text-red-500 text-center">{errorMessage}</p>
                )}
              </div>
            </form>
          )}

          {/* Date Modal */}
          <AnimatePresence>
            {isModalOpen && (
              <DateModal
                sendAt={sendAt}
                onSelect={(date) => {
                  setSendAt(date);
                  setErrorMessage('');
                  setIsModalOpen(false);
                }}
                onClose={() => setIsModalOpen(false)}
                anchorRef={pillRef}
              />
            )}
          </AnimatePresence>

          {/* Footer */}
          <div className="mt-8 text-center text-base text-[#9198B2] tracking-wide">
            <p className="mb-1">
              Made with &#128153; by{' '}
              <a
                href="https://twitter.com/abdussalampopsy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#9198B2]/70 no-underline hover:text-[#9198B2] transition-colors"
              >
                Abdussalam
              </a>
            </p>
            <a
              href="https://buymeacoffee.com/abdussalampopsy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#9198B2]/70 no-underline hover:text-[#9198B2] transition-colors"
            >
              Support this project &#9749;
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
