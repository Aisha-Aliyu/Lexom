import { supabase, isSupabaseEnabled } from "../lib/supabase";
import { leaderboardLimiter, leaderboardReadLimiter } from "../utils/rateLimiter";

/**
 * Sanitize username to prevent XSS — strip HTML and limit chars.
 */
const sanitizeUsername = (username) => {
  return username
    .replace(/[<>'"&]/g, "")
    .replace(/\s+/g, "_")
    .substring(0, 20)
    .trim();
};

/**
 * Submit a score to the leaderboard.
 * Returns { success, error }
 */
export const submitScore = async ({ username, dateKey, attempts, hardMode, timeSeconds }) => {
  if (!isSupabaseEnabled) return { success: false, error: "Leaderboard unavailable" };

  if (!leaderboardLimiter.check()) {
    return { success: false, error: "Too many submissions. Try again later." };
  }

  const clean = sanitizeUsername(username);
  if (clean.length < 2) {
    return { success: false, error: "Username must be at least 2 characters." };
  }

  const { error } = await supabase.from("leaderboard").insert({
    username: clean,
    date_key: dateKey,
    attempts,
    hard_mode: hardMode,
    time_seconds: Math.max(0, Math.min(timeSeconds, 86400)), // cap at 24h
  });

  if (error) {
    // Unique constraint = already submitted today
    if (error.code === "23505") {
      return { success: false, error: "You already submitted a score today!" };
    }
    return { success: false, error: "Could not save score. Try again." };
  }

  return { success: true };
};

/**
 * Fetch today's leaderboard.
 * Returns { data, error }
 */
export const fetchLeaderboard = async (dateKey) => {
  if (!isSupabaseEnabled) return { data: [], error: "Leaderboard unavailable" };

  if (!leaderboardReadLimiter.check()) {
    return { data: [], error: "Too many requests. Try again later." };
  }

  const { data, error } = await supabase
    .from("leaderboard")
    .select("username, attempts, hard_mode, time_seconds, created_at")
    .eq("date_key", dateKey)
    .order("attempts", { ascending: true })
    .order("time_seconds", { ascending: true })
    .limit(50);

  if (error) return { data: [], error: "Could not load leaderboard." };
  return { data, error: null };
};
