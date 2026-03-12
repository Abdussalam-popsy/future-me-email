# Turnstile Integration Guide

How to integrate the `useTurnstile` hook into `App.jsx`:

## 1. Import the hook

```js
import { useTurnstile } from './hooks/useTurnstile';
```

## 2. Replace existing Turnstile state/refs/useEffect

Replace:
- `turnstileRef` ref
- `turnstileWidgetId` ref
- `turnstileToken` state
- The Turnstile `useEffect` block

With:
```js
const { isVerifying, execute, reset } = useTurnstile();
```

## 3. Remove the visible Turnstile container

Remove this JSX element:
```jsx
<div ref={turnstileRef} className="mb-4 md:mb-0"></div>
```

The invisible widget is now rendered offscreen by the hook automatically.

## 4. Update handleSubmit

Instead of sending `turnstileToken` directly, use `execute()` which triggers
verification and provides the token via callback:

```js
const handleSubmit = async (e) => {
  e.preventDefault();
  setButtonState('verifying');
  execute(async (token) => {
    setButtonState('sending');
    // ... rest of the fetch call, using `token` as cf_turnstile_response
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email,
          subject: `Letter from your past self`,
          message: letter,
          timeValue,
          timeUnit,
          cf_turnstile_response: token,
        }),
      });
      // ... handle response
    } catch (error) {
      // ... handle error
    }
  });
};
```

## 5. Update reset points

In all places where the Turnstile widget was previously reset (error handler,
`handleWriteAnother`, etc.), call `reset()` from the hook:

```js
reset();
```

## 6. Update SubmitButton disabled prop

```jsx
<SubmitButton buttonState={buttonState} disabled={buttonState !== 'idle'} />
```

This ensures the button is disabled during verifying, sending, success, and error states.
