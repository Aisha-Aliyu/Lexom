const STATS_KEY = "lexom_stats";
const GAME_STATE_KEY = "lexom_game_state";

export const defaultStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  lastWonDate: null,
};

export const loadStats = () => {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    return raw ? { ...defaultStats, ...JSON.parse(raw) } : { ...defaultStats };
  } catch {
    return { ...defaultStats };
  }
};

export const saveStats = (stats) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    console.warn("Could not save stats to localStorage");
  }
};

export const updateStats = (stats, won, numGuesses, todayKey) => {
  const updated = { ...stats };
  updated.gamesPlayed += 1;

  if (won) {
    updated.gamesWon += 1;
    updated.guessDistribution = {
      ...updated.guessDistribution,
      [numGuesses]: (updated.guessDistribution[numGuesses] || 0) + 1,
    };

    // Streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    if (updated.lastWonDate === yKey || updated.lastWonDate === todayKey) {
      updated.currentStreak += 1;
    } else {
      updated.currentStreak = 1;
    }

    updated.maxStreak = Math.max(updated.maxStreak, updated.currentStreak);
    updated.lastWonDate = todayKey;
  } else {
    updated.currentStreak = 0;
  }

  return updated;
};

// Save and restore daily game progress so refreshing doesn't lose your game
export const saveDailyProgress = (dateKey, state) => {
  try {
    localStorage.setItem(
      GAME_STATE_KEY,
      JSON.stringify({ dateKey, ...state })
    );
  } catch {
    console.warn("Could not save game progress");
  }
};

export const loadDailyProgress = (dateKey) => {
  try {
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.dateKey !== dateKey) return null; // stale, different day
    return data;
  } catch {
    return null;
  }
};
