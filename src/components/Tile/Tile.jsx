import { TILE_STATE } from "../../utils/wordUtils";
import styles from "./Tile.module.css";
import clsx from "clsx";

const Tile = ({ letter = "", state = TILE_STATE.EMPTY, isFirst = false, reveal = false, revealDelay = 0 }) => {
  const filled = letter !== "";

  return (
    <div
      className={clsx(styles.tile, {
        [styles.filled]: filled && state === TILE_STATE.EMPTY,
        [styles.correct]: state === TILE_STATE.CORRECT,
        [styles.present]: state === TILE_STATE.PRESENT,
        [styles.absent]: state === TILE_STATE.ABSENT,
        [styles.locked]: isFirst,
        [styles.reveal]: reveal,
      })}
      style={reveal ? { animationDelay: `${revealDelay}ms` } : {}}
      aria-label={`${letter || "empty"} ${state}`}
    >
      {letter}
    </div>
  );
};

export default Tile;
