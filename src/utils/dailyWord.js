import { WORDS } from "../data/words";

/**
 * Gets a deterministic word based on the current date.
 * Everyone in the world gets the same word each day.
 * Resets at midnight local time.
 */
export const getDailyWord = () => {
  const now = new Date();
  // Create a date-based seed: YYYYMMDD
  const seed =
    now.getFullYear() * 10000 +
    (now.getMonth() + 1) * 100 +
    now.getDate();

  const index = seed % WORDS.length;
  return WORDS[index];
};

/**
 * Returns a string key like "2026-02-25" for today.
 * Used to check if the user already played today.
 */
export const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
