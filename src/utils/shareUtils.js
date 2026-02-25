import { TILE_STATE } from "./wordUtils";

const EMOJI_MAP = {
  [TILE_STATE.CORRECT]: "🟩",
  [TILE_STATE.PRESENT]: "🟨",
  [TILE_STATE.ABSENT]: "⬛",
  [TILE_STATE.EMPTY]: "⬜",
};

/**
 * Generates the shareable emoji grid text.
 * Format matches SUTOM/Wordle sharing style.
 */
export const buildShareText = (evaluations, gameState, todayKey, hardMode) => {
  const appName = import.meta.env.VITE_APP_NAME || "Lexom";
  const attempts = gameState === "won" ? evaluations.length : "X";
  const maxAttempts = parseInt(import.meta.env.VITE_MAX_ATTEMPTS) || 6;
  const hard = hardMode ? "*" : "";

  const grid = evaluations
    .map((row) => row.map((state) => EMOJI_MAP[state] || "⬜").join(""))
    .join("\n");

  return `${appName} ${todayKey} ${attempts}/${maxAttempts}${hard}\n\n${grid}\n\nhttps://lexom.app`;
};

/**
 * Copy text to clipboard with fallback for older mobile browsers.
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older mobile browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    return success;
  } catch {
    return false;
  }
};
