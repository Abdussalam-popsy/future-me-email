import { useState, useRef, useEffect } from 'react';
import TimeSelector from './components/TimeSelector';
import LetterForm from './components/LetterForm';
import SubmitButton from './components/SubmitButton';
import ConfirmationScreen from './components/ConfirmationScreen';

function App() {
  const getCurrentDate = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`;
  };

  const [form, setForm] = useState({
    to: '',
    subject: '',
    message: '',
    signature: 'Keep Pushing,\nPast You',
    timeValue: 1,
    timeUnit: 'years',
  });
  const [buttonState, setButtonState] = useState('idle');
  // States: 'idle' | 'sending' | 'success' | 'error'
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);

  useEffect(() => {
    const renderWidget = () => {
      if (window.turnstile && turnstileRef.current && turnstileWidgetId.current === null) {
        turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(null),
        });
      }
    };

    // If turnstile is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
    } else {
      // Otherwise wait for it to load
      const interval = setInterval(() => {
        if (window.turnstile) {
          renderWidget();
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonState('sending');

    // Add minimum delay so user can see "Sending..." state
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
            timeValue: form.timeValue.toString(),
            timeUnit: form.timeUnit,
            cf_turnstile_response: turnstileToken,
          }),
        }),
        minimumDelay // Wait at least 1 second
      ]);

      if (res.ok) {
        setButtonState('success');

        // Calculate delivery date
        const delivery = new Date();
        const tv = parseInt(form.timeValue);
        switch (form.timeUnit) {
          case 'minutes': delivery.setMinutes(delivery.getMinutes() + tv); break;
          case 'hours': delivery.setHours(delivery.getHours() + tv); break;
          case 'days': delivery.setDate(delivery.getDate() + tv); break;
          case 'weeks': delivery.setDate(delivery.getDate() + tv * 7); break;
          case 'months': delivery.setMonth(delivery.getMonth() + tv); break;
          case 'years': delivery.setFullYear(delivery.getFullYear() + tv); break;
        }
        setDeliveryDate(delivery);

        // Show "Sent!" briefly, then transition to confirmation screen
        setTimeout(() => {
          setShowConfirmation(true);
        }, 1500);
      } else {
        console.error('Failed to send:', res.statusText);
        setButtonState('error');

        // Reset Turnstile
        setTurnstileToken(null);
        if (turnstileWidgetId.current !== null) {
          window.turnstile.reset(turnstileWidgetId.current);
        }

        setTimeout(() => {
          setButtonState('idle');
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setButtonState('error');

      // Reset Turnstile
      setTurnstileToken(null);
      if (turnstileWidgetId.current !== null) {
        window.turnstile.reset(turnstileWidgetId.current);
      }

      setTimeout(() => {
        setButtonState('idle');
      }, 3000);
    }
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
      timeValue: 1,
      timeUnit: 'years',
    });
    // Reset Turnstile
    setTurnstileToken(null);
    if (turnstileWidgetId.current !== null) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
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
                {/* Time badge - Top Right */}
                <TimeSelector
                  timeValue={form.timeValue}
                  timeUnit={form.timeUnit}
                  onTimeValueChange={(val) => setForm({ ...form, timeValue: val })}
                  onTimeUnitChange={(val) => setForm({ ...form, timeUnit: val })}
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
                getCurrentDate={getCurrentDate}
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

                {/* Turnstile widget */}
                <div ref={turnstileRef} className="mb-4 md:mb-0"></div>

                {/* Submit button */}
                <SubmitButton buttonState={buttonState} disabled={buttonState !== 'idle' || !turnstileToken} />
              </div>
            </div>
          </form>
        )}

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
