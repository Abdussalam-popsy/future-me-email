import { useState } from 'react';

function App() {
  const [form, setForm] = useState({
    to: '',
    subject: '',
    message: '',
    signature: 'Keep Pushing,\nPast You',
    timeValue: '1',
    timeUnit: 'years',
  });

  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getTimeLabel = () => {
    const value = parseInt(form.timeValue);
    const unit = form.timeUnit;
    return `${value} ${unit === 'years' && value === 1 ? 'year' : unit === 'months' && value === 1 ? 'month' : unit === 'weeks' && value === 1 ? 'week' : unit === 'days' && value === 1 ? 'day' : unit} from now`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('sending');

    // Simulate timeline animation
    setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/schedule-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: form.to,
            subject: form.subject,
            message: `${form.message}\n\n${form.signature}`,
            timeValue: form.timeValue,
            timeUnit: form.timeUnit,
          }),
        });

        if (res.ok) {
          setStatus('success');
          // Clear form after 2 seconds
          setTimeout(() => {
            setForm({
              to: '',
              subject: '',
              message: '',
              signature: 'Keep Pushing,\nPast You',
              timeValue: '1',
              timeUnit: 'years',
            });
            setStatus(null);
            setIsSubmitting(false);
          }, 2000);
        } else {
          setStatus('error');
          setIsSubmitting(false);
        }
      } catch (err) {
        console.error(err);
        setStatus('error');
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <div style={{ 
      fontFamily: '"Inter Tight", sans-serif',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#EDF3FF',
      padding: '2rem 1rem',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        .timeline-container {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(237, 243, 255, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          opacity: 0;
          pointer-events: none;
          transition: opacity 200ms cubic-bezier(.25, .46, .45, .94);
        }

        .timeline-container.active {
          opacity: 1;
          pointer-events: all;
        }

        .timeline {
          position: relative;
          width: 400px;
          max-width: 90%;
        }

        .timeline-track {
          height: 4px;
          background: #D1E0FF;
          border-radius: 2px;
          overflow: hidden;
        }

        .timeline-progress {
          height: 100%;
          background: linear-gradient(90deg, #3B82F6, #60A5FA);
          width: 0%;
          animation: progress 800ms cubic-bezier(.19, 1, .22, 1) forwards;
        }

        @keyframes progress {
          to { width: 100%; }
        }

        .timeline-icon {
          position: absolute;
          top: -20px;
          left: 0;
          width: 48px;
          height: 48px;
          background: #3B82F6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          animation: moveIcon 800ms cubic-bezier(.19, 1, .22, 1) forwards;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        @keyframes moveIcon {
          to { left: calc(100% - 48px); }
        }

        .success-message {
          position: absolute;
          top: 80px;
          font-size: 1.1rem;
          font-weight: 500;
          color: #0B1431;
          opacity: 0;
          animation: fadeInSuccess 300ms cubic-bezier(.25, .46, .45, .94) 600ms forwards;
        }

        @keyframes fadeInSuccess {
          to { opacity: 1; }
        }
      `}</style>

      {/* Timeline Animation Overlay */}
      <div className={`timeline-container ${status === 'sending' ? 'active' : ''}`}>
        <div className="timeline">
          <div className="timeline-track">
            <div className="timeline-progress"></div>
          </div>
          <div className="timeline-icon">🚀</div>
          {status === 'success' && (
            <div className="success-message">Sent to the future! ✨</div>
          )}
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '600px' }}>
        <h1 style={{ 
          fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
          fontWeight: '600',
          color: '#0B1431',
          textAlign: 'center',
          marginBottom: '2rem',
          lineHeight: '1.2'
        }}>
          Write a letter to your future-self
        </h1>

        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: 'clamp(1.5rem, 4vw, 2.5rem)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        }}>
          {/* Header with email and time */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '0.5rem'
              }}>
                To:
              </label>
              <input
                type="email"
                name="to"
                placeholder="meinthefuture@gmail.com"
                value={form.to}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem 0',
                  fontSize: '0.95rem',
                  border: 'none',
                  borderBottom: '1px solid #E5E7EB',
                  color: '#0B1431',
                  outline: 'none',
                  background: 'transparent',
                  transition: 'border-color 200ms ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            <div style={{
              padding: '0.5rem 1rem',
              background: '#DBEAFE',
              color: '#1E40AF',
              borderRadius: '20px',
              fontSize: '0.875rem',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              {getTimeLabel()}
            </div>
          </div>

          {/* Subject */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'baseline',
              gap: '0.5rem'
            }}>
              <span style={{ 
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#0B1431'
              }}>
                Tittle:
              </span>
              <input
                type="text"
                name="subject"
                placeholder="Did we make it"
                value={form.subject}
                onChange={handleChange}
                required
                style={{
                  flex: '1',
                  padding: '0.25rem 0',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  color: '#0B1431',
                  outline: 'none',
                  background: 'transparent',
                  transition: 'border-color 200ms ease'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                onBlur={(e) => e.target.style.borderColor = 'transparent'}
              />
            </div>
          </div>

          {/* Message */}
          <div style={{ marginBottom: '1.5rem' }}>
            <textarea
              name="message"
              placeholder="Dear Future Me,&#10;&#10;I hope you still locked in and doing what it takes to stay disciplined at attain success in your field."
              value={form.message}
              onChange={handleChange}
              required
              rows="8"
              style={{
                width: '100%',
                padding: '0.75rem 0',
                fontSize: '0.95rem',
                lineHeight: '1.7',
                border: 'none',
                color: '#4B5563',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
                background: 'transparent'
              }}
            />
          </div>

          {/* Signature */}
          <div style={{ marginBottom: '2rem' }}>
            <textarea
              name="signature"
              value={form.signature}
              onChange={handleChange}
              rows="2"
              style={{
                width: '100%',
                padding: '0.5rem 0',
                fontSize: '0.95rem',
                lineHeight: '1.5',
                border: 'none',
                color: '#6B7280',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                background: 'transparent'
              }}
            />
          </div>

          {/* Time selector and submit button */}
          <div style={{ 
            display: 'flex', 
            gap: '0.75rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ 
                display: 'block',
                fontSize: '0.875rem',
                color: '#6B7280',
                marginBottom: '0.5rem'
              }}>
                Send in
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  name="timeValue"
                  value={form.timeValue}
                  onChange={handleChange}
                  style={{
                    flex: '0 0 80px',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#0B1431',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
                
                <select
                  name="timeUnit"
                  value={form.timeUnit}
                  onChange={handleChange}
                  style={{
                    flex: '1',
                    padding: '0.75rem',
                    fontSize: '0.95rem',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#0B1431',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="minutes">minutes</option>
                  <option value="days">days</option>
                  <option value="weeks">weeks</option>
                  <option value="months">months</option>
                  <option value="years">years</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                flex: '0 0 auto',
                padding: '0.875rem 2.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting ? '#93C5FD' : '#3B82F6',
                color: '#ffffff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => !isSubmitting && (e.target.style.backgroundColor = '#2563EB')}
              onMouseLeave={(e) => !isSubmitting && (e.target.style.backgroundColor = '#3B82F6')}
            >
              {isSubmitting ? 'Sending...' : 'Send to the future'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: '#6B7280'
        }}>
          <p style={{ marginBottom: '0.5rem' }}>
            Made with 💙 by{' '}
            <a 
              href="https://twitter.com/abdussalampopsy" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#0B1431', textDecoration: 'none', fontWeight: '500' }}
            >
              Abdussalam
            </a>
          </p>
          <a 
            href="https://buymeacoffee.com/abdussalampopsy" 
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#6B7280',
              textDecoration: 'none',
              transition: 'color 200ms ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#0B1431'}
            onMouseLeave={(e) => e.target.style.color = '#6B7280'}
          >
            Support this project ☕
          </a>
        </div>
      </div>
    </div>
  );
}

export default App;