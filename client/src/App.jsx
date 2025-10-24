import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from './Spinner';

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
    timeText: '1 year',
  });
    const [buttonState, setButtonState] = useState('idle');
    // States: 'idle' | 'sending' | 'success' | 'error'

    const buttonCopy = {
      idle: <span>Send to the future</span>,
      sending: (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={24} color="rgba(255, 255, 255, 0.8)"/>
    </span>
  ),
      success: <span>Sent!</span>,
      error: <span>Failed to send</span>,
    };
  const timeInputRef = useRef(null);

  const parseTimeText = (text) => {
    const match = text.match(/(\d+)\s*(minute|min|hour|hr|day|week|month|year)s?/i);
    if (!match) return { value: 1, unit: 'years' };
    
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    
    const unitMap = {
      'minute': 'minutes', 'min': 'minutes',
      'hour': 'hours', 'hr': 'hours',
      'day': 'days',
      'week': 'weeks',
      'month': 'months',
      'year': 'years'
    };
    
    return { value, unit: unitMap[unit] || 'years' };
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setButtonState('sending');

    const { value, unit } = parseTimeText(form.timeText);

     // ADD THIS DEBUGGING CODE:
    console.log('=== EMAIL SCHEDULE DEBUG ===');
    console.log('User typed:', form.timeText);
    console.log('Parsed value:', value);
    console.log('Parsed unit:', unit);
    console.log('Full payload:', {
    to: form.to,
    subject: form.subject,
    timeValue: value.toString(),
    timeUnit: unit,
  });
  console.log('========================');

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
            timeValue: value.toString(),
            timeUnit: unit,
          }),
        }),
        minimumDelay // Wait at least 1 second
      ]);

      console.log('Response status:', res.status);

      if (res.ok) {
        setButtonState('success');
        
        // Reset form immediately
        setForm({
          to: '',
          subject: '',
          message: '',
          signature: 'Keep Pushing,\nPast You',
          timeText: '1 year',
        });

        // Show "Sent!" for 2 seconds, then reset button
        setTimeout(() => {
          setButtonState('idle');
        }, 2000);
      } else {
        console.error('Failed to send:', res.statusText);
        setButtonState('error');
        setTimeout(() => {
          setButtonState('idle');
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setButtonState('error');
      setTimeout(() => {
        setButtonState('idle');
      }, 3000);
    }
  };


  const adjustTimeInputWidth = () => {
  if (timeInputRef.current) {
    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.font = window.getComputedStyle(timeInputRef.current).font;
    span.style.fontSize = window.getComputedStyle(timeInputRef.current).fontSize;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.textContent = timeInputRef.current.value || timeInputRef.current.placeholder;
    
    document.body.appendChild(span);
    const textWidth = span.offsetWidth;
    document.body.removeChild(span);
    
    // Add padding (32px for px-4 on both sides) + small buffer
    const totalWidth = textWidth + 32 + 8;
    
    // Set min (70px) and max (150px)
    const finalWidth = Math.min(Math.max(totalWidth, 70), 150);
    
    timeInputRef.current.style.width = `${finalWidth}px`;
  }
};

useEffect(() => {
  adjustTimeInputWidth();
}, [form.timeText]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light px-4 py-8">
      <div className="w-full max-w-[630px]">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary text-center mb-8 leading-tight text-balance">
          Write a letter to your future-self
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm mx-4 md:mx-0">
            <div className="flex flex-col gap-6 md:flex-row-reverse md:items-center md:justify-between mb-6">
              {/* Time badge - Top Right */}
              <div className="flex items-center gap-1 justify-end">
                <input
                  ref={timeInputRef}
                  type="text"
                  name="timeText"
                  placeholder="1 year"
                  value={form.timeText}
                  onChange={handleChange}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border-none outline-none text-center"
                />
                <span className="text-sm text-blue-700 font-medium">from now</span>
              </div>

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

            {/* Subject */}
            <div className="mb-6">
              <input
                type="text"
                name="subject"
                placeholder={`A letter from ${getCurrentDate()}`}
                value={form.subject}
                onChange={handleChange}
                required
                className="w-full py-2 text-2xl md:text-3xl font-semibold border-none text-primary outline-none bg-transparent placeholder:text-gray-300"
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <textarea
                name="message"
                placeholder="Dear Future Me,&#10;&#10;I hope you still locked in and doing what it takes to stay disciplined at attain success in your field."
                value={form.message}
                onChange={handleChange}
                required
                rows="8"
                className="w-full py-3 text-base leading-relaxed border-none text-gray-600 outline-none resize-vertical bg-transparent placeholder:text-gray-400"
              />
            </div>


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

              {/* Submit button - Full Width */}
              <motion.button
                type="submit"
                disabled={buttonState !== 'idle'}
                whileHover={buttonState === 'idle' ? { scale: 1.02 } : {}}
                whileTap={buttonState === 'idle' ? { scale: 0.98 } : {}}
                className={`flex items-center justify-center w-full md:w-auto md:min-w-[240px] -mx-0 -mt-0 -mb-0 md:mx-0 md:mb-0 md:flex-shrink-0 py-4 text-base font-medium border-none rounded-full text-white transition-all duration-200 ${
                  buttonState === 'error'
                  ? 'bg-red-500 cursor-not-allowed'
                    : buttonState === 'sending'
                    ? 'bg-blue-400 cursor-not-allowed'
                    : buttonState === 'success'
                    ? 'bg-green-500 cursor-not-allowed'
                    : 'bg-primary-blue hover:bg-blue-600 cursor-pointer'
                }`}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span 
                    key={buttonState}
                    transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                    initial={{ y: -25, opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 25 }}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      width: '100%',
                      height: '100%'
                    }}
                  >
                    {buttonCopy[buttonState]}
                  </motion.span>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p className="mb-2">
            Made with 💙 by{' '}
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
            Support this project ☕
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;