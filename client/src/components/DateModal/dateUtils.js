export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBeforeToday(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const compare = new Date(date);
  compare.setHours(0, 0, 0, 0);
  return compare < today;
}

export function isToday(date) {
  const today = new Date();
  return isSameDay(date, today);
}

export function formatPillDate(date) {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function formatShortDate(date) {
  return `${MONTH_NAMES_SHORT[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export function clampDate(date) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const clamped = new Date(date);
  clamped.setHours(0, 0, 0, 0);
  return clamped < tomorrow ? tomorrow : clamped;
}

export function getNextBirthday(month, day) {
  const now = new Date();
  const thisYear = now.getFullYear();
  let birthday = new Date(thisYear, month, day);
  birthday.setHours(0, 0, 0, 0);

  // If the birthday this year has already passed (or is today), use next year
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  if (birthday < tomorrow) {
    birthday = new Date(thisYear + 1, month, day);
    birthday.setHours(0, 0, 0, 0);
  }

  return birthday;
}

export function addToDate(base, amount, unit) {
  const result = new Date(base);
  switch (unit) {
    case 'year':
      result.setFullYear(result.getFullYear() + amount);
      break;
    case 'month':
      result.setMonth(result.getMonth() + amount);
      break;
    case 'day':
      result.setDate(result.getDate() + amount);
      break;
    default:
      break;
  }
  result.setHours(0, 0, 0, 0);
  return result;
}
