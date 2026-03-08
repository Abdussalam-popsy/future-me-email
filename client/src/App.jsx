import { useState, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import DatePill from './components/DateModal/DatePill';
import DateModal from './components/DateModal/DateModal';
import LetterForm from './components/LetterForm';
import SubmitButton from './components/SubmitButton';
import ConfirmationScreen from './components/ConfirmationScreen';
import { useTurnstile } from './hooks/useTurnstile';

function App() {
  const [form, setForm] = useState({
    to: '',
    subject: '',
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

  const { execute, reset } = useTurnstile();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonState('verifying');

    execute(async (token) => {
      setButtonState('sending');

      const minimumDelay = new Promise(resolve => setTimeout(resolve, 1000));

      try {
        const [res] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/schedule-email`, {
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
          console.error('Failed to send:', res.statusText);
          setButtonState('error');
          reset();

          setTimeout(() => {
            setButtonState('idle');
          }, 3000);
        }
      } catch (err) {
        console.error('Error sending email:', err);
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
      subject: '',
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light px-4 py-8">
      <div className="w-full max-w-[630px]">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary text-center mb-8 leading-tight text-balance">
          Write a letter to your future-self
        </h1>

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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 flex-shrink-0">To:</span>
                  <input
                    type="email"
                    name="to"
                    placeholder="meinthefuture@gmail.com"
                    value={form.to}
                    onChange={handleChange}
                    required
                    className="flex-1 py-1 text-sm border-none text-primary outline-none bg-transparent placeholder:text-gray-400"
                  />
                </div>
              </div>

              <LetterForm
                form={form}
                onFormChange={(name, value) => setForm({ ...form, [name]: value })}
                sendAt={sendAt}
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
                    className="w-full py-2 text-lg tracking-widest leading-relaxed border-none text-gray-500 outline-none resize-none bg-transparent font-fasthand"
                  />
                </div>

                {/* Submit button */}
                <SubmitButton buttonState={buttonState} disabled={buttonState !== 'idle'} />
              </div>
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
                setIsModalOpen(false);
              }}
              onClose={() => setIsModalOpen(false)}
              anchorRef={pillRef}
            />
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            Made with &#128153; by{' '}
            <a
              href="https://twitter.com/abdussalampopsy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary no-underline font-medium hover:text-primary-blue transition-colors"
            >
              Abdussalam
            </a>
          </p>
          <a
            href="https://buymeacoffee.com/abdussalampopsy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 no-underline hover:text-primary transition-colors"
          >
            Support this project &#9749;
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;
