import Modal from "../Modal/Modal";
import styles from "./HowToPlay.module.css";

const examples = [
  {
    word: ["P", "L", "A", "N", "E", "T"],
    states: ["correct", "correct", "absent", "absent", "absent", "absent"],
    note: "P and L are in the correct position.",
  },
  {
    word: ["P", "O", "L", "I", "C", "E"],
    states: ["correct", "absent", "present", "absent", "absent", "absent"],
    note: "L is in the word but wrong position.",
  },
  {
    word: ["P", "A", "R", "R", "O", "T"],
    states: ["correct", "absent", "absent", "absent", "absent", "absent"],
    note: "Only P is correct. Other letters are not in the word.",
  },
];

const ExampleTile = ({ letter, state }) => (
  <div className={`${styles.tile} ${styles[state]}`}>{letter}</div>
);

const HowToPlay = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="How to Play">
    <div className={styles.content}>
      <p>Guess the <strong>LEXOM</strong> word in 6 tries.</p>
      <ul className={styles.rules}>
        <li>The <strong>first letter</strong> is always revealed: SUTOM style!</li>
        <li>Each guess must be a valid 6-letter word.</li>
        <li>The color of tiles will change to show how close your guess was.</li>
      </ul>

      <hr className={styles.divider} />
      <p className={styles.examplesTitle}>Examples</p>

      {examples.map((ex, i) => (
        <div key={i} className={styles.example}>
          <div className={styles.row}>
            {ex.word.map((l, j) => (
              <ExampleTile key={j} letter={l} state={ex.states[j]} />
            ))}
          </div>
          <p className={styles.note}>{ex.note}</p>
        </div>
      ))}

      <hr className={styles.divider} />
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.correct}`} />
          <span>Correct position</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.present}`} />
          <span>Wrong position</span>
        </div>
        <div className={styles.legendItem}>
          <span className={`${styles.dot} ${styles.absent}`} />
          <span>Not in word</span>
        </div>
      </div>
    </div>
  </Modal>
);

export default HowToPlay;
