import Row from "../Row/Row";
import styles from "./Board.module.css";

const Board = ({ board, currentRow, evaluations, shake }) => {
  return (
    <div className={styles.board} aria-label="Game board">
      {board.map((tiles, i) => (
        <Row
          key={i}
          tiles={tiles}
          evaluation={evaluations[i] || null}
          isShaking={shake && i === currentRow}
        />
      ))}
    </div>
  );
};

export default Board;
