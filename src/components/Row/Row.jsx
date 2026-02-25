import Tile from "../Tile/Tile";
import { TILE_STATE } from "../../utils/wordUtils";
import styles from "./Row.module.css";
import clsx from "clsx";

const Row = ({ tiles = [], evaluation = null, isShaking = false }) => {
  return (
    <div className={clsx(styles.row, { [styles.shake]: isShaking })} role="group">
      {tiles.map((letter, i) => (
        <Tile
          key={i}
          letter={letter}
          state={evaluation ? evaluation[i] : TILE_STATE.EMPTY}
          isFirst={i === 0}
          reveal={!!evaluation}
          revealDelay={i * 300}
        />
      ))}
    </div>
  );
};

export default Row;
