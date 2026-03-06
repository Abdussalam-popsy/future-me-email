function TimeSelector({ timeValue, timeUnit, onTimeValueChange, onTimeUnitChange }) {
  return (
    <div className="flex items-center gap-1 justify-end">
      <input
        type="number"
        min="1"
        max="99"
        value={timeValue}
        onChange={(e) => onTimeValueChange(e.target.value)}
        className="w-16 px-2 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border-none outline-none text-center"
      />
      <select
        value={timeUnit}
        onChange={(e) => onTimeUnitChange(e.target.value)}
        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border-none outline-none cursor-pointer appearance-none"
      >
        <option value="minutes">minutes</option>
        <option value="hours">hours</option>
        <option value="days">days</option>
        <option value="weeks">weeks</option>
        <option value="months">months</option>
        <option value="years">years</option>
      </select>
      <span className="text-sm text-blue-700 font-medium">from now</span>
    </div>
  );
}

export default TimeSelector;
