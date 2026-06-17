export function checkRateLimit(setCooldown: (n: number) => void): boolean {
  const key = "roast_limit_timestamps";
  const limit = 5;
  const windowMs = 15 * 60 * 1000;
  const now = Date.now();

  let timestamps: number[] = [];
  try {
    timestamps = JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    timestamps = [];
  }
  timestamps = timestamps.filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const remainingMs = windowMs - (now - oldest);
    setCooldown(Math.ceil(remainingMs / 1000 / 60));
    return false;
  }

  timestamps.push(now);
  localStorage.setItem(key, JSON.stringify(timestamps));
  return true;
}