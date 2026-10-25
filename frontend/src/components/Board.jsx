import React from 'react';
import Cell from './Cell';

export default function Board({ board, winningCells, isGameCompleted, onCellClick, isLoading }) {
  return (
    <div className="board-container" aria-label="Tic Tac Toe Board">
      <div className="board-grid" id="tic-tac-toe-board">
        {board.map((cellValue, idx) => (
          <Cell
            key={idx}
            index={idx}
            value={cellValue}
            isWinning={winningCells.includes(idx)}
            isLocked={isGameCompleted || isLoading}
            onClick={onCellClick}
          />
        ))}
      </div>
    </div>
  );
}
