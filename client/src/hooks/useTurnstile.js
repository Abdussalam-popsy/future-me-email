import { useState, useRef, useEffect, useCallback } from 'react';

export function useTurnstile() {
  const [turnstileToken, setTurnstileToken] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const widgetId = useRef(null);
  const containerRef = useRef(null);
  const pendingCallback = useRef(null);

  useEffect(() => {
    // Create an offscreen container for the invisible widget
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    document.body.appendChild(container);
    containerRef.current = container;

    const renderWidget = () => {
      if (window.turnstile && widgetId.current === null) {
        widgetId.current = window.turnstile.render(container, {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          appearance: 'interaction-only',
          execution: 'execute',
          callback: (token) => {
            setTurnstileToken(token);
            setIsVerifying(false);
            // If there's a pending submit, invoke it
            if (pendingCallback.current) {
              const cb = pendingCallback.current;
              pendingCallback.current = null;
              cb(token);
            }
          },
          'expired-callback': () => {
            setTurnstileToken(null);
          },
          'error-callback': () => {
            setTurnstileToken(null);
            setIsVerifying(false);
            if (pendingCallback.current) {
              pendingCallback.current = null;
            }
          },
        });
      }
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
      if (containerRef.current) {
        containerRef.current.remove();
      }
    };
  }, []);

  // Execute Turnstile and call back with token
  const execute = useCallback((callback) => {
    if (turnstileToken) {
      // Already have a valid token
      callback(turnstileToken);
      return;
    }

    setIsVerifying(true);
    pendingCallback.current = callback;

    if (widgetId.current !== null) {
      window.turnstile.execute(widgetId.current);
    }
  }, [turnstileToken]);

  // Reset the widget
  const reset = useCallback(() => {
    setTurnstileToken(null);
    setIsVerifying(false);
    pendingCallback.current = null;
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }
  }, []);

  return { turnstileToken, isVerifying, execute, reset };
}
