import { formatShortDate } from './DateModal/dateUtils';

function LetterForm({ form, onFormChange, sendAt }) {
  const handleChange = (e) => {
    onFormChange(e.target.name, e.target.value);
  };

  return (
    <>
      {/* Subject */}
      <div className="mb-6">
        <input
          type="text"
          name="subject"
          placeholder={`A letter from ${formatShortDate(new Date())}`}
          value={form.subject}
          onChange={handleChange}
          required
          className="w-full py-2 text-2xl md:text-[28px] font-semibold border-none text-black outline-none bg-transparent placeholder:text-gray-300"
        />
      </div>

      {/* Message */}
      <div className="mb-6">
        <textarea
          name="message"
          placeholder={"Dear Future Me,\n\nI hope you still locked in and doing what it takes to stay disciplined to attain success in your field."}
          value={form.message}
          onChange={handleChange}
          required
          maxLength={10000}
          rows="8"
          className="w-full py-3 text-base leading-relaxed border-none text-[#9198B2] outline-none resize-vertical bg-transparent placeholder:text-[#9198B2] tracking-wide"
        />
        {form.message.length > 0 && (
          <p className={`text-xs text-right ${form.message.length >= 9500 ? 'text-red-400' : 'text-gray-400'}`}>
            {form.message.length.toLocaleString()} / 10,000
          </p>
        )}
      </div>
    </>
  );
}

export default LetterForm;
