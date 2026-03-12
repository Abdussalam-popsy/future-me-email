import { motion } from 'framer-motion';

function ConfirmationScreen({ deliveryDate, onWriteAnother }) {
  const formattedDate = deliveryDate
    ? deliveryDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const shareText = encodeURIComponent(
    `I just wrote a letter to my future self. It'll arrive on ${formattedDate}. Try it yourself: ${window.location.origin}`
  );

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}`;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl md:rounded-3xl shadow-sm mx-4 md:mx-0 text-center overflow-hidden"
    >
      {/* Envelope visual */}
      <div className="relative pt-12 pb-8 px-8">
        {/* Letter peeks out then slides into envelope */}
        <div className="relative w-32 h-24 mx-auto mb-2">
          {/* Envelope back */}
          <div className="absolute inset-0 bg-[#E8F0FE] rounded-lg" />

          {/* Letter paper sliding in */}
          <motion.div
            className="absolute left-3 right-3 bg-white rounded-sm shadow-sm border border-gray-100"
            style={{ height: 60 }}
            initial={{ top: -30 }}
            animate={{ top: 12 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Tiny text lines on the letter */}
            <div className="p-2.5 space-y-1.5">
              <div className="h-[3px] w-10 bg-gray-200 rounded-full" />
              <div className="h-[3px] w-16 bg-gray-100 rounded-full" />
              <div className="h-[3px] w-12 bg-gray-100 rounded-full" />
            </div>
          </motion.div>

          {/* Envelope flap closing */}
          <motion.div
            className="absolute left-0 right-0 top-0 origin-top"
            initial={{ rotateX: 180 }}
            animate={{ rotateX: 0 }}
            transition={{ delay: 1.0, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 400, transformStyle: 'preserve-3d' }}
          >
            <svg viewBox="0 0 128 48" fill="none" className="w-full">
              <path d="M0 0L64 40L128 0V8H0V0Z" fill="#D4E8FF" />
              <path d="M0 0L64 40L128 0" stroke="#C0D8F0" strokeWidth="1" fill="none" />
            </svg>
          </motion.div>

          {/* Envelope front (covers letter bottom) */}
          <div className="absolute left-0 right-0 bottom-0 h-14 bg-[#E8F0FE] rounded-b-lg" />

          {/* Blue seal */}
          <motion.div
            className="absolute left-1/2 -translate-x-1/2 bottom-3 w-7 h-7 bg-[#2188FF] rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, duration: 0.3, type: 'spring', stiffness: 400, damping: 15 }}
          >
            <motion.svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 1.7, duration: 0.3 }}
            >
              <motion.path
                d="M3.5 7L6 9.5L10.5 4.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 1.7, duration: 0.3 }}
              />
            </motion.svg>
          </motion.div>
        </div>

        {/* Floating up animation for the whole envelope */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.4 }}
        >
          <p className="text-[#2188FF] text-xs font-semibold tracking-[0.2em] uppercase mt-6 mb-6">
            Your letter is sealed
          </p>
        </motion.div>

        {/* Delivery info */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.4 }}
        >
          <p className="text-[#9198B2] text-sm mb-1">Arriving</p>
          <p className="text-black text-lg md:text-xl font-semibold">{formattedDate}</p>
        </motion.div>
      </div>

      {/* Divider */}
      <motion.div
        className="mx-8 h-px bg-gray-100"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 2.4, duration: 0.3 }}
      />

      {/* Actions */}
      <motion.div
        className="px-8 py-6 space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.4 }}
      >
        <p className="text-sm text-[#9198B2]">
          Tell someone to write to their future self
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#2188FF] hover:text-[#1a6fd4] transition-colors font-medium"
          >
            Share on X
          </a>
          <span className="hidden sm:inline text-gray-200">|</span>
          <button
            onClick={onWriteAnother}
            className="text-sm text-[#9198B2] hover:text-black transition-colors font-medium bg-transparent border-none cursor-pointer"
          >
            Write another letter
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ConfirmationScreen;
