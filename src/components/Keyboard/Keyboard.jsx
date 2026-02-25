import styles from "./Keyboard.module.css";
import clsx from "clsx";

const ROWS = [
  ["A","Z","E","R","T","Y","U","I","O","P"],
  ["Q","S","D","F","G","H","J","K","L","M"],
  ["ENTER","W","X","C","V","B","N","⌫"],
];

const Key = ({ value, state, onClick }) => (
  <button
    className={clsx(styles.key, {
      [styles.correct]: state === "correct",
      [styles.present]: state === "present",
      [styles.absent]: state === "absent",
      [styles.wide]: value === "ENTER" || value === "⌫",
    })}
    onClick={() => onClick(value)}
    aria-label={value}
  >
    {value}
  </button>
);

const Keyboard = ({ onKey, onDelete, onEnter, keyboardStates }) => {
  const handleClick = (value) => {
    if (value === "⌫") onDelete();
    else if (value === "ENTER") onEnter();
    else onKey(value);
  };

  return (
    <div className={styles.keyboard} role="group" aria-label="Keyboard">
      {ROWS.map((row, i) => (
        <div key={i} className={styles.row}>
          {row.map((key) => (
            <Key
              key={key}
              value={key}
              state={keyboardStates[key] || ""}
              onClick={handleClick}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Keyboard;
