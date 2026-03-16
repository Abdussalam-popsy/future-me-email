import { motion } from 'framer-motion';

function ConfirmationInfo({ deliveryDate, onWriteAnother, visible, reducedMotion }) {
  const instant = reducedMotion ? 0 : undefined;

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
      className="text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 12,
      }}
      transition={{ duration: instant ?? 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="text-[#2188FF] text-xs font-semibold tracking-[0.2em] uppercase mb-6">
        Your letter is on its way
      </p>

      <p className="text-[#9198B2] text-sm mb-1">Arriving</p>
      <p className="text-black text-lg md:text-xl font-semibold mb-6">{formattedDate}</p>

      <div className="mx-auto w-16 h-px bg-gray-200 mb-6" />

      <p className="text-sm text-[#9198B2] mb-4">
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
  );
}

export default ConfirmationInfo;
