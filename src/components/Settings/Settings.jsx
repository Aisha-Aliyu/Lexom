import Modal from "../Modal/Modal";
import styles from "./Settings.module.css";

const Toggle = ({ enabled, onToggle, label, description }) => (
  <div className={styles.setting}>
    <div className={styles.settingText}>
      <span className={styles.settingLabel}>{label}</span>
      <span className={styles.settingDesc}>{description}</span>
    </div>
    <button
      role="switch"
      aria-checked={enabled}
      className={`${styles.toggle} ${enabled ? styles.on : ""}`}
      onClick={onToggle}
      aria-label={label}
    >
      <span className={styles.thumb} />
    </button>
  </div>
);

const Settings = ({ isOpen, onClose, hardMode, onToggleHardMode }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Settings">
    <div className={styles.content}>
      <Toggle
        enabled={hardMode}
        onToggle={onToggleHardMode}
        label="Hard Mode"
        description="Any revealed hints must be used in subsequent guesses"
      />
    </div>
  </Modal>
);

export default Settings;
