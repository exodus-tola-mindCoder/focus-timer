export function getLocalISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseLocalISODate(dateStr) {
  const [y, m, d] = dateStr.split('-').map((v) => Number(v));
  // Construct in local time to avoid timezone shifts.
  return new Date(y, m - 1, d);
}

export function addDaysLocal(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function formatMMSS(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatShortDate(date) {
  // Example: "Mar 26"
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

