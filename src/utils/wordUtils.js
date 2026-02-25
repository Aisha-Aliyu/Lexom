// Tile states
export const TILE_STATE = {
  EMPTY: "empty",
  FILLED: "filled",
  CORRECT: "correct",       // Right letter, right position (green)
  PRESENT: "present",       // Right letter, wrong position (yellow)
  ABSENT: "absent",         // Letter not in word (red/dark)
};

/**
 * Core SUTOM evaluation logic
 * SUTOM rule: first letter is always revealed and locked
 * Returns array of tile states for a guess
 */
export const evaluateGuess = (guess, target) => {
  const guessArr = guess.toUpperCase().split("");
  const targetArr = target.toUpperCase().split("");
  const result = Array(guessArr.length).fill(TILE_STATE.ABSENT);
  const targetUsed = Array(targetArr.length).fill(false);
  const guessUsed = Array(guessArr.length).fill(false);

  // First pass: find correct positions (green)
  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = TILE_STATE.CORRECT;
      targetUsed[i] = true;
      guessUsed[i] = true;
    }
  }

  // Second pass: find present letters (yellow)
  for (let i = 0; i < guessArr.length; i++) {
    if (guessUsed[i]) continue;
    for (let j = 0; j < targetArr.length; j++) {
      if (!targetUsed[j] && guessArr[i] === targetArr[j]) {
        result[i] = TILE_STATE.PRESENT;
        targetUsed[j] = true;
        break;
      }
    }
  }

  return result;
};

/**
 * Build keyboard letter states from all guesses so far
 */
export const buildKeyboardStates = (guesses, evaluations) => {
  const states = {};
  const priority = {
    [TILE_STATE.CORRECT]: 3,
    [TILE_STATE.PRESENT]: 2,
    [TILE_STATE.ABSENT]: 1,
  };

  guesses.forEach((guess, gi) => {
    if (!evaluations[gi]) return;
    guess.split("").forEach((letter, li) => {
      const newState = evaluations[gi][li];
      const existing = states[letter];
      if (!existing || priority[newState] > priority[existing]) {
        states[letter] = newState;
      }
    });
  });

  return states;
};
