import { useState, useEffect } from "react";
import { useGame, GAME_STATE } from "./hooks/useGame";
import { useConfetti } from "./hooks/useConfetti";
import { useTimer } from "./hooks/useTimer";
import { getTodayKey } from "./utils/dailyWord";
import Board from "./components/Board/Board";
import Keyboard from "./components/Keyboard/Keyboard";
import Header from "./components/Header/Header";
import HowToPlay from "./components/HowToPlay/HowToPlay";
import Stats from "./components/Stats/Stats";
import Settings from "./components/Settings/Settings";
import Leaderboard from "./components/Leaderboard/Leaderboard";
import styles from "./App.module.css";

function App() {
  const [hardMode, setHardMode] = useState(
    () => localStorage.getItem("lexom_hardmode") === "true"
  );
  const [showHowToPlay, setShowHowToPlay] = useState(
    () => !localStorage.getItem("lexom_played_before")
  );
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const {
    board,
    currentRow,
    evaluations,
    gameState,
    shake,
    message,
    keyboardStates,
    stats,
    isDailyMode,
    addLetter,
    deleteLetter,
    submitGuess,
    resetGame,
  } = useGame(hardMode);

  const { fireConfetti } = useConfetti();
  const { seconds: elapsedSeconds } = useTimer(gameState === GAME_STATE.PLAYING);
  const todayKey = getTodayKey();

  // Fire confetti on win
  useEffect(() => {
    if (gameState === GAME_STATE.WON) {
      setTimeout(fireConfetti, 400);
    }
  }, [gameState, fireConfetti]);

  // Auto-show stats after game ends
  useEffect(() => {
    if (gameState !== GAME_STATE.PLAYING) {
      const t = setTimeout(() => setShowStats(true), 2500);
      return () => clearTimeout(t);
    }
  }, [gameState]);

  const handleCloseHowToPlay = () => {
    localStorage.setItem("lexom_played_before", "true");
    setShowHowToPlay(false);
  };

  const handleToggleHardMode = () => {
    if (evaluations.length > 0) return;
    const next = !hardMode;
    setHardMode(next);
    localStorage.setItem("lexom_hardmode", String(next));
  };

  // Physical keyboard
  useEffect(() => {
    const anyModalOpen = showHowToPlay || showStats || showSettings || showLeaderboard;
    const handleKeyDown = (e) => {
      if (anyModalOpen) return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER") submitGuess();
      else if (key === "BACKSPACE") deleteLetter();
      else if (/^[A-Z]$/.test(key)) addLetter(key);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addLetter, deleteLetter, submitGuess, showHowToPlay, showStats, showSettings, showLeaderboard]);

  return (
    <div className={styles.app}>
      <Header
        onHowToPlay={() => setShowHowToPlay(true)}
        onStats={() => setShowStats(true)}
        onSettings={() => setShowSettings(true)}
        onLeaderboard={() => setShowLeaderboard(true)}
        hardMode={hardMode}
      />

      {message && (
        <div className={styles.message} role="alert" aria-live="polite">
          {message}
        </div>
      )}

      <main className={styles.main}>
        <Board
          board={board}
          currentRow={currentRow}
          evaluations={evaluations}
          shake={shake}
        />
      </main>

      <footer className={styles.footer}>
        <Keyboard
          onKey={addLetter}
          onDelete={deleteLetter}
          onEnter={submitGuess}
          keyboardStates={keyboardStates}
        />

        {gameState !== GAME_STATE.PLAYING && !isDailyMode && (
          <button className={styles.resetBtn} onClick={resetGame}>
            New Game
          </button>
        )}

        {gameState !== GAME_STATE.PLAYING && isDailyMode && (
          <p className={styles.dailyNote}>Come back tomorrow for a new word!</p>
        )}
      </footer>

      <HowToPlay isOpen={showHowToPlay} onClose={handleCloseHowToPlay} />

      <Stats
        isOpen={showStats}
        onClose={() => setShowStats(false)}
        stats={stats}
        currentRow={currentRow}
        gameState={gameState}
        evaluations={evaluations}
        hardMode={hardMode}
      />

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        hardMode={hardMode}
        onToggleHardMode={handleToggleHardMode}
      />

      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        dateKey={todayKey}
        gameState={gameState}
        attempts={currentRow + 1}
        hardMode={hardMode}
        elapsedSeconds={elapsedSeconds}
      />
    </div>
  );
}

export default App;
