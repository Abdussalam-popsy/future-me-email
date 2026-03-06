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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-sm mx-4 md:mx-0 text-center"
    >
      <div className="text-5xl mb-6">&#9993;</div>

      <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
        Your letter is on its way
      </h2>

      <p className="text-base text-gray-600 mb-6">
        It will arrive on{' '}
        <span className="font-medium text-primary">{formattedDate}</span>
      </p>

      <div className="mb-8">
        <p className="text-sm text-gray-500 mb-2">
          Tell someone to write to their future self
        </p>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary-blue hover:text-blue-600 transition-colors font-medium"
        >
          Share on X / Twitter
        </a>
      </div>

      <button
        onClick={onWriteAnother}
        className="px-8 py-3 text-base font-medium rounded-full border-2 border-primary-blue text-primary-blue bg-transparent hover:bg-blue-50 transition-colors cursor-pointer"
      >
        Write another letter
      </button>
    </motion.div>
  );
}

export default ConfirmationScreen;
