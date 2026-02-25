/**
 * Client-side rate limiter using localStorage.
 * Limits actions to maxRequests per windowMs.
 * This is a UX guard — real rate limiting must also be on the server/Supabase edge.
 */
export class RateLimiter {
  constructor(key, maxRequests = 100, windowMs = 60 * 60 * 1000) {
    this.key = `lexom_rl_${key}`;
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  _getRecord() {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : { count: 0, windowStart: Date.now() };
    } catch {
      return { count: 0, windowStart: Date.now() };
    }
  }

  _saveRecord(record) {
    try {
      localStorage.setItem(this.key, JSON.stringify(record));
    } catch {
      // Silently fail if localStorage is full
    }
  }

  /**
   * Returns true if the action is allowed, false if rate limited.
   */
  check() {
    const now = Date.now();
    let record = this._getRecord();

    // Reset window if expired
    if (now - record.windowStart > this.windowMs) {
      record = { count: 0, windowStart: now };
    }

    if (record.count >= this.maxRequests) {
      return false;
    }

    record.count += 1;
    this._saveRecord(record);
    return true;
  }

  getRemainingRequests() {
    const now = Date.now();
    const record = this._getRecord();
    if (now - record.windowStart > this.windowMs) return this.maxRequests;
    return Math.max(0, this.maxRequests - record.count);
  }
}

// Shared instance for leaderboard submissions — max 10 per hour
export const leaderboardLimiter = new RateLimiter("leaderboard", 10, 60 * 60 * 1000);

// Shared instance for leaderboard reads — max 100 per hour
export const leaderboardReadLimiter = new RateLimiter("leaderboard_read", 100, 60 * 60 * 1000);
