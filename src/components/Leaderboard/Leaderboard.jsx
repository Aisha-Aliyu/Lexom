import { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { fetchLeaderboard, submitScore } from "../../services/leaderboardService";
import { isSupabaseEnabled } from "../../lib/supabase";
import styles from "./Leaderboard.module.css";

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
};

const Leaderboard = ({
  isOpen,
  onClose,
  dateKey,
  gameState,
  attempts,
  hardMode,
  elapsedSeconds,
}) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState(
    () => localStorage.getItem("lexom_username") || ""
  );
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = gameState === "won" && isSupabaseEnabled;

  useEffect(() => {
    if (!isOpen) return;
    loadEntries();
  }, [isOpen, dateKey]);

  const loadEntries = async () => {
    setLoading(true);
    setError("");
    const { data, error: err } = await fetchLeaderboard(dateKey);
    setLoading(false);
    if (err) { setError(err); return; }
    setEntries(data);
  };

  const handleSubmit = async () => {
    if (!username.trim()) {
      setSubmitError("Please enter a username.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    localStorage.setItem("lexom_username", username.trim());

    const { success, error: err } = await submitScore({
      username: username.trim(),
      dateKey,
      attempts,
      hardMode,
      timeSeconds: elapsedSeconds,
    });

    setSubmitting(false);
    if (!success) { setSubmitError(err); return; }
    setSubmitted(true);
    loadEntries();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leaderboard">
      <div className={styles.content}>

        {canSubmit && !submitted && (
          <div className={styles.submitSection}>
            <p className={styles.submitTitle}>You won in {attempts} {attempts === 1 ? "guess" : "guesses"}! Add your score:</p>
            <div className={styles.inputRow}>
              <input
                className={styles.input}
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value.slice(0, 20))}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                maxLength={20}
                aria-label="Username"
                autoComplete="off"
                spellCheck={false}
              />
              <button
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "..." : "Submit"}
              </button>
            </div>
            {submitError && <p className={styles.error}>{submitError}</p>}
          </div>
        )}

        {submitted && (
          <div className={styles.successBanner}>
            ✅ Score submitted! Good luck on the leaderboard.
          </div>
        )}

        <div className={styles.tableWrapper}>
          {loading ? (
            <div className={styles.loading}>Loading...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : entries.length === 0 ? (
            <div className={styles.empty}>No scores yet today. Be the first!</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th>Guesses</th>
                  <th>Time</th>
                  <th>Mode</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, i) => (
                  <tr
                    key={i}
                    className={entry.username === username ? styles.myRow : ""}
                  >
                    <td className={styles.rank}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className={styles.player}>{entry.username}</td>
                    <td className={styles.center}>{entry.attempts}</td>
                    <td className={styles.center}>{formatTime(entry.time_seconds)}</td>
                    <td className={styles.center}>
                      {entry.hard_mode ? <span className={styles.hardTag}>H</span> : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button className={styles.refreshBtn} onClick={loadEntries}>
          ↻ Refresh
        </button>
      </div>
    </Modal>
  );
};

export default Leaderboard;
