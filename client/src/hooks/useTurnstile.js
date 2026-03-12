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

  const timeoutRef = useRef(null);

  // Execute Turnstile and call back with token
  const execute = useCallback((callback) => {
    // In development, bypass Turnstile — send a dummy token
    if (import.meta.env.DEV) {
      callback('dev-bypass-token');
      return;
    }

    if (turnstileToken) {
      // Already have a valid token
      callback(turnstileToken);
      return;
    }

    setIsVerifying(true);

    // Wrap the callback so we can clear the timeout when the token arrives
    const wrappedCallback = (token) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      callback(token);
    };

    pendingCallback.current = wrappedCallback;

    // 10-second timeout: if token hasn't arrived, call back with null
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      if (pendingCallback.current) {
        const cb = pendingCallback.current;
        pendingCallback.current = null;
        setIsVerifying(false);
        cb(null);
      }
    }, 10000);

    if (widgetId.current !== null) {
      window.turnstile.execute(widgetId.current);
    }
  }, [turnstileToken]);

  // Reset the widget
  const reset = useCallback(() => {
    setTurnstileToken(null);
    setIsVerifying(false);
    pendingCallback.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (widgetId.current !== null && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    }
  }, []);

  return { turnstileToken, isVerifying, execute, reset };
}
