function LetterForm({ form, onFormChange, getCurrentDate }) {
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
          placeholder={`A letter from ${getCurrentDate()}`}
          value={form.subject}
          onChange={handleChange}
          required
          className="w-full py-2 text-2xl md:text-3xl font-semibold border-none text-primary outline-none bg-transparent placeholder:text-gray-300"
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
          rows="8"
          className="w-full py-3 text-base leading-relaxed border-none text-gray-600 outline-none resize-vertical bg-transparent placeholder:text-gray-400"
        />
      </div>
    </>
  );
}

export default LetterForm;
