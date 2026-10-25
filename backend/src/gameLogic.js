// Pure helper functions for Tic Tac Toe logic

export const WINNING_LINES = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Col 1
  [1, 4, 7], // Col 2
  [2, 5, 8], // Col 3
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6]  // Diagonal top-right to bottom-left
];

export const CORNERS = [0, 2, 6, 8];
export const CENTER = 4;
export const EDGES = [1, 3, 5, 7];

/**
 * Checks if a board has a winner or is a draw.
 * @param {Array<string|null>} board - 9-element array
 * @returns {{ status: 'InProgress' | 'Won' | 'Draw', winner: string|null, winningCells: number[] }}
 */
export function checkGameState(board) {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        status: 'Won',
        winner: board[a],
        winningCells: line
      };
    }
  }

  const isFull = board.every(cell => cell !== null);
  if (isFull) {
    return {
      status: 'Draw',
      winner: null,
      winningCells: []
    };
  }

  return {
    status: 'InProgress',
    winner: null,
    winningCells: []
  };
}

/**
 * Converts row & column (1-indexed or 0-indexed) or cellIndex into a 0-indexed cell index (0..8).
 */
export function normalizeCellIndex({ cellIndex, row, col }) {
  if (typeof cellIndex === 'number' && Number.isInteger(cellIndex)) {
    return cellIndex;
  }

  if (typeof row === 'number' && typeof col === 'number') {
    // Check if 1-indexed (1..3)
    if (row >= 1 && row <= 3 && col >= 1 && col <= 3) {
      return (row - 1) * 3 + (col - 1);
    }
    // Or 0-indexed (0..2)
    if (row >= 0 && row <= 2 && col >= 0 && col <= 2) {
      return row * 3 + col;
    }
  }

  return -1;
}

/**
 * Formats a 0-indexed cell position into human-readable Row X, Column Y (1-indexed).
 */
export function formatPosition(index) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  return `Row ${row}, Column ${col}`;
}

/**
 * Calculates computer's move based on the strict requirements:
 * Priority:
 * 1. If O can win, play the winning move
 * 2. If X can win next, block X
 * 3. Take center if available
 * 4. Take a corner if available
 * 5. Take any available cell
 * 
 * @param {Array<string|null>} board - 9-element array
 * @returns {number} cell index (0..8) or -1 if no move available
 */
export function getComputerMove(board) {
  const emptyCells = board
    .map((val, idx) => (val === null ? idx : null))
    .filter(val => val !== null);

  if (emptyCells.length === 0) return -1;

  // 1. If O can win, play the winning move
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'O';
    const result = checkGameState(testBoard);
    if (result.status === 'Won' && result.winner === 'O') {
      return cell;
    }
  }

  // 2. If X can win next, block X
  for (const cell of emptyCells) {
    const testBoard = [...board];
    testBoard[cell] = 'X';
    const result = checkGameState(testBoard);
    if (result.status === 'Won' && result.winner === 'X') {
      return cell;
    }
  }

  // 3. Take center if available
  if (board[CENTER] === null) {
    return CENTER;
  }

  // 4. Take a corner if available
  for (const corner of CORNERS) {
    if (board[corner] === null) {
      return corner;
    }
  }

  // 5. Take any available cell
  return emptyCells[0];
}
