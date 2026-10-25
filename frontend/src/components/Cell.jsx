import React from 'react';

export default function Cell({ index, value, isWinning, isLocked, onClick }) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;

  let cellClass = 'cell-button';
  if (value === 'X') cellClass += ' cell-x';
  if (value === 'O') cellClass += ' cell-o';
  if (isWinning) cellClass += ' winning-cell';

  return (
    <button
      type="button"
      id={`cell-${index}`}
      className={cellClass}
      disabled={isLocked || value !== null}
      onClick={() => onClick(index)}
      aria-label={`Row ${row}, Column ${col}: ${value ? `Player ${value}` : 'Empty'}`}
    >
      {value}
    </button>
  );
}
