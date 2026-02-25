import { useState, useEffect, useCallback } from "react";
import { getRandomWord, isValidWord } from "../data/words";
import { evaluateGuess, TILE_STATE, buildKeyboardStates } from "../utils/wordUtils";
import { getDailyWord, getTodayKey } from "../utils/dailyWord";
import {
  loadStats,
  saveStats,
  updateStats,
  saveDailyProgress,
  loadDailyProgress,
} from "../utils/statsUtils";

const WORD_LENGTH = parseInt(import.meta.env.VITE_WORD_LENGTH) || 6;
const MAX_ATTEMPTS = parseInt(import.meta.env.VITE_MAX_ATTEMPTS) || 6;
const DAILY_MODE = import.meta.env.VITE_DAILY_MODE === "true";

export const GAME_STATE = {
  PLAYING: "playing",
  WON: "won",
  LOST: "lost",
};

const createEmptyBoard = () =>
  Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(""));

export const useGame = (hardMode = false) => {
  const todayKey = getTodayKey();

  const getInitialState = () => {
    if (DAILY_MODE) {
      const saved = loadDailyProgress(todayKey);
      if (saved) {
        return {
          targetWord: getDailyWord(),
          board: saved.board,
          currentRow: saved.currentRow,
          currentCol: saved.currentCol,
          evaluations: saved.evaluations,
          gameState: saved.gameState,
        };
      }
    }
    const word = DAILY_MODE ? getDailyWord() : getRandomWord();
    const board = createEmptyBoard();
    board[0][0] = word[0]; // SUTOM: pre-fill first letter
    return {
      targetWord: word,
      board,
      currentRow: 0,
      currentCol: 1,
      evaluations: [],
      gameState: GAME_STATE.PLAYING,
    };
  };

  const initial = getInitialState();
  const [targetWord, setTargetWord] = useState(initial.targetWord);
  const [board, setBoard] = useState(initial.board);
  const [currentRow, setCurrentRow] = useState(initial.currentRow);
  const [currentCol, setCurrentCol] = useState(initial.currentCol);
  const [evaluations, setEvaluations] = useState(initial.evaluations);
  const [gameState, setGameState] = useState(initial.gameState);
  const [shake, setShake] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState(() => loadStats());

  // Pre-fill first letter when row changes
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      if (!next[currentRow][0]) {
        next[currentRow][0] = targetWord[0];
      }
      return next;
    });
  }, [currentRow, targetWord, gameState]);

  // Persist daily progress on every change
  useEffect(() => {
    if (!DAILY_MODE) return;
    saveDailyProgress(todayKey, {
      board,
      currentRow,
      currentCol,
      evaluations,
      gameState,
    });
  }, [board, currentRow, currentCol, evaluations, gameState, todayKey]);

  const showMessage = (msg, duration = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const addLetter = useCallback(
    (letter) => {
      if (gameState !== GAME_STATE.PLAYING) return;
      if (currentCol >= WORD_LENGTH) return;
      setBoard((prev) => {
        const next = prev.map((row) => [...row]);
        next[currentRow][currentCol] = letter.toUpperCase();
        return next;
      });
      setCurrentCol((c) => c + 1);
    },
    [currentCol, currentRow, gameState]
  );

  const deleteLetter = useCallback(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    if (currentCol <= 1) return;
    setBoard((prev) => {
      const next = prev.map((row) => [...row]);
      next[currentRow][currentCol - 1] = "";
      return next;
    });
    setCurrentCol((c) => c - 1);
  }, [currentCol, currentRow, gameState]);

  const submitGuess = useCallback(() => {
    if (gameState !== GAME_STATE.PLAYING) return;
    if (currentCol !== WORD_LENGTH) {
      triggerShake();
      showMessage("Not enough letters");
      return;
    }

    const guess = board[currentRow].join("");

    if (!isValidWord(guess)) {
      triggerShake();
      showMessage("Word not in list");
      return;
    }

    // Hard mode: must use revealed hints
    if (hardMode && evaluations.length > 0) {
      for (let i = 0; i < evaluations.length; i++) {
        const prevGuess = board[i].join("");
        for (let j = 0; j < WORD_LENGTH; j++) {
          if (evaluations[i][j] === "correct" && guess[j] !== prevGuess[j]) {
            triggerShake();
            showMessage(`Position ${j + 1} must be ${prevGuess[j]}`);
            return;
          }
        }
      }
    }

    const result = evaluateGuess(guess, targetWord);
    const newEvaluations = [...evaluations, result];
    setEvaluations(newEvaluations);

    if (guess === targetWord) {
      const newStats = updateStats(stats, true, currentRow + 1, todayKey);
      setStats(newStats);
      saveStats(newStats);
      setGameState(GAME_STATE.WON);
      const messages = ["Genius! 🧠", "Magnificent! ✨", "Impressive! 🎉", "Splendid! 👏", "Great! 😊", "Phew! 😅"];
      showMessage(messages[currentRow] || "Nice!", 4000);
    } else if (currentRow + 1 >= MAX_ATTEMPTS) {
      const newStats = updateStats(stats, false, 0, todayKey);
      setStats(newStats);
      saveStats(newStats);
      setGameState(GAME_STATE.LOST);
      showMessage(`The word was ${targetWord}`, 5000);
    } else {
      setCurrentRow((r) => r + 1);
      setCurrentCol(1);
    }
  }, [board, currentCol, currentRow, evaluations, gameState, hardMode, stats, targetWord, todayKey]);

  const resetGame = useCallback(() => {
    if (DAILY_MODE) return; // Can't reset in daily mode
    const word = getRandomWord();
    const newBoard = createEmptyBoard();
    newBoard[0][0] = word[0];
    setTargetWord(word);
    setBoard(newBoard);
    setCurrentRow(0);
    setCurrentCol(1);
    setEvaluations([]);
    setGameState(GAME_STATE.PLAYING);
    setMessage("");
  }, []);

  const keyboardStates = buildKeyboardStates(
    evaluations.map((_, i) => board[i].join("")),
    evaluations
  );

  return {
    board,
    currentRow,
    evaluations,
    gameState,
    shake,
    message,
    keyboardStates,
    targetWord,
    stats,
    isDailyMode: DAILY_MODE,
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
    WORD_LENGTH,
    MAX_ATTEMPTS,
  };
};
