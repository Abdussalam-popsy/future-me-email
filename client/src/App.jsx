import { useState } from 'react';

function App() {
  const [form, setForm] = useState({
    to: '',
    subject: '',
    message: '',
    timeValue: '2',
    timeUnit: 'minutes',
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Scheduling...');

    console.log('Form data being sent:', form);

    try {
      const res = await fetch('/schedule-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const text = await res.text();
      setStatus(res.ok ? '✓ Email scheduled!' : `✗ Failed: ${text}`);
      
      if (res.ok) {
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setStatus('✗ Error sending request');
    }
  };

  return (
    <div style={{ 
      fontFamily: '"Inter Tight", sans-serif',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      padding: '2rem',
      width: '100%'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;600&display=swap');
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        
        body, html {
          width: 100%;
          background-color: #ffffff;
          justify-content: center;
        }
        
        input, textarea, select {
          font-family: 'Inter Tight', sans-serif;
        }
      `}</style>
      
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <h1 style={{ 
          fontSize: '2rem',
          fontWeight: '600',
          color: '#0B1431',
          textAlign: 'center',
          marginBottom: '0.5rem',
          lineHeight: '1.2'
        }}>
          Write a message to<br />your future-self
        </h1>
        
        <div style={{ marginTop: '2.5rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.95rem',
              color: '#0B1431',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              A letter to
            </label>
            <input
              type="email"
              name="to"
              placeholder="Enter an email address"
              value={form.to}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '0.95rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#EDF3FF',
                color: '#0B1431',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.95rem',
              color: '#0B1431',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Give your letter a title
            </label>
            <input
              type="text"
              name="subject"
              placeholder="I got a new job!"
              value={form.subject}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '0.95rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#EDF3FF',
                color: '#0B1431',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.95rem',
              color: '#0B1431',
              marginBottom: '0.5rem',
              fontWeight: '500'
            }}>
              Write your letter
            </label>
            <textarea
              name="message"
              placeholder="Dear Future Me,&#10;&#10;After over 7 months of rejections, you won't belief what happened today."
              value={form.message}
              onChange={handleChange}
              required
              rows="6"
              style={{
                width: '100%',
                padding: '0.875rem 1rem',
                fontSize: '0.95rem',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: '#EDF3FF',
                color: '#0B1431',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ 
              display: 'block',
              fontSize: '0.95rem',
              color: '#0B1431',
              marginBottom: '0.75rem',
              fontWeight: '500'
            }}>
              Send this letter in
            </label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <select
                name="timeValue"
                value={form.timeValue}
                onChange={handleChange}
                style={{
                  flex: '0 0 80px',
                  padding: '0.875rem 0.75rem',
                  fontSize: '0.95rem',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#EDF3FF',
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
                  minWidth: '120px',
                  padding: '0.875rem 1rem',
                  fontSize: '0.95rem',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#EDF3FF',
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
              
              <button 
                onClick={handleSubmit}
                style={{
                  flex: '0 0 auto',
                  padding: '0.875rem 2rem',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#0B1431',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Schedule Email
              </button>
            </div>
          </div>

          {status && (
            <p style={{
              textAlign: 'center',
              fontSize: '0.95rem',
              color: status.includes('✓') ? '#22c55e' : '#ef4444',
              marginTop: '1rem'
            }}>
              {status}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;