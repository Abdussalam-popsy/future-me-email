import { useState, useCallback } from 'react';

export function useTurnstile() {
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [pendingCallback, setPendingCallback] = useState(null);

  // Execute Turnstile verification — opens the modal or bypasses in dev
  const execute = useCallback((callback) => {
    // In development, bypass Turnstile — send a dummy token
    if (import.meta.env.DEV) {
      callback('dev-bypass-token');
      return;
    }

    setPendingCallback(() => callback);
    setShowTurnstileModal(true);
  }, []);

  // Called by TurnstileModal on successful verification
  const handleTurnstileSuccess = useCallback((token) => {
    setShowTurnstileModal(false);
    if (pendingCallback) {
      pendingCallback(token);
      setPendingCallback(null);
    }
  }, [pendingCallback]);

  // Called when modal is closed (Escape key)
  const handleTurnstileClose = useCallback(() => {
    setShowTurnstileModal(false);
    setPendingCallback(null);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setShowTurnstileModal(false);
    setPendingCallback(null);
  }, []);

  return {
    showTurnstileModal,
    execute,
    reset,
    handleTurnstileSuccess,
    handleTurnstileClose,
  };
}
