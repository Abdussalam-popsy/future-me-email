import { useState } from 'react';

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

  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    setStatus('sending');

    const { value, unit } = parseTimeText(form.timeText);

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
        setStatus('success');
        
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
          setStatus(null);
          setIsSubmitting(false);
        }, 2000);
      } else {
        console.error('Failed to send:', res.statusText);
        setStatus('error');
        setTimeout(() => {
          setStatus(null);
          setIsSubmitting(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error sending email:', err);
      setStatus('error');
      setTimeout(() => {
        setStatus(null);
        setIsSubmitting(false);
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg-light px-4 py-8">
      <div className="w-full max-w-[630px]">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-primary text-center mb-8 leading-tight">
          Write a letter to your future-self
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm mx-4 md:mx-0">
            {/* Time badge - Top Right */}
            <div className="flex justify-end mb-6">
              <input
                type="text"
                name="timeText"
                placeholder="1 year from now"
                value={form.timeText + ' from now'}
                onChange={(e) => setForm({ ...form, timeText: e.target.value.replace(' from now', '') })}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border-none outline-none text-center min-w-[160px]"
              />
            </div>

            {/* To Field */}
            <div className="flex items-center gap-2 mb-6">
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

            {/* Signature */}
            <div className="mb-8">
              <textarea
                name="signature"
                value={form.signature}
                onChange={handleChange}
                rows="2"
                className="w-full py-2 text-base leading-relaxed border-none text-gray-500 outline-none resize-none bg-transparent font-fasthand"
              />
            </div>

            {/* Submit button - Full Width */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 text-base font-medium border-none rounded-full text-white transition-all duration-200 ${
                status === 'error'
                  ? 'bg-red-500 cursor-not-allowed'
                  : isSubmitting 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-primary-blue hover:bg-blue-600 cursor-pointer'
              }`}
            >
              {status === 'error' 
                ? 'Failed to send' 
                : status === 'success' 
                ? 'Sent!' 
                : isSubmitting 
                ? 'Sending...' 
                : 'Send to the future'}
            </button>
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