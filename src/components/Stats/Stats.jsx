import { useState } from "react";
import Modal from "../Modal/Modal";
import { buildShareText, copyToClipboard } from "../../utils/shareUtils";
import { getTodayKey } from "../../utils/dailyWord";
import { useCountdown } from "../../hooks/useCountdown";
import styles from "./Stats.module.css";

const StatItem = ({ value, label }) => (
  <div className={styles.statItem}>
    <span className={styles.statValue}>{value}</span>
    <span className={styles.statLabel}>{label}</span>
  </div>
);

const Stats = ({ isOpen, onClose, stats, currentRow, gameState, evaluations, hardMode }) => {
  const [copied, setCopied] = useState(false);
  const countdown = useCountdown();
  const todayKey = getTodayKey();

  const winPct = stats.gamesPlayed > 0
    ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
    : 0;

  const maxDist = Math.max(...Object.values(stats.guessDistribution), 1);

  const handleShare = async () => {
    const text = buildShareText(evaluations, gameState, todayKey, hardMode);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Statistics">
      <div className={styles.content}>

        <div className={styles.statsRow}>
          <StatItem value={stats.gamesPlayed} label="Played" />
          <StatItem value={winPct} label="Win %" />
          <StatItem value={stats.currentStreak} label="Streak" />
          <StatItem value={stats.maxStreak} label="Best Streak" />
        </div>

        <hr className={styles.divider} />

        <p className={styles.sectionTitle}>Guess Distribution</p>
        <div className={styles.distribution}>
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const count = stats.guessDistribution[num] || 0;
            const width = Math.max(Math.round((count / maxDist) * 100), 7);
            const isHighlighted = gameState === "won" && currentRow + 1 === num;
            return (
              <div key={num} className={styles.distRow}>
                <span className={styles.distNum}>{num}</span>
                <div className={styles.barWrapper}>
                  <div
                    className={`${styles.bar} ${isHighlighted ? styles.highlight : ""}`}
                    style={{ width: `${width}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <hr className={styles.divider} />

        <div className={styles.bottomRow}>
          <div className={styles.countdown}>
            <p className={styles.countdownLabel}>Next word in</p>
            <p className={styles.countdownTime}>
              {countdown.hours}:{countdown.minutes}:{countdown.seconds}
            </p>
          </div>

          {gameState !== "playing" && (
            <button className={styles.shareBtn} onClick={handleShare}>
              {copied ? "✓ Copied!" : "Share 🔗"}
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default Stats;
