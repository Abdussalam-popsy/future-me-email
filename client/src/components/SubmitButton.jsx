import { motion, AnimatePresence } from 'framer-motion';
import { Spinner } from '../Spinner';

const buttonCopy = {
  idle: <span>Send to the future</span>,
  sending: (
    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={24} color="rgba(255, 255, 255, 0.8)" />
    </span>
  ),
  success: <span>Sent!</span>,
  error: <span>Failed to send</span>,
};

function SubmitButton({ buttonState, disabled }) {
  return (
    <motion.button
      type="submit"
      disabled={disabled}
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
            height: '100%',
          }}
        >
          {buttonCopy[buttonState]}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

export default SubmitButton;
