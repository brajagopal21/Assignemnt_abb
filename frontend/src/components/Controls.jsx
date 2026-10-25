import React from 'react';
import { RotateCcw, Undo2, Trash2 } from 'lucide-react';

export default function Controls({
  canUndo,
  onUndo,
  onResetGame,
  onResetScoreboard,
  isLoading,
  gameMode
}) {
  return (
    <div className="controls-toolbar" id="controls-toolbar">
      <button
        type="button"
        id="undo-btn"
        className="btn btn-secondary"
        onClick={onUndo}
        disabled={!canUndo || isLoading}
        title={
          !canUndo
            ? 'Undo is disabled (no moves or game completed)'
            : gameMode === 'computer'
            ? 'Undo last turn (reverts both computer move and your move)'
            : 'Undo last move'
        }
      >
        <Undo2 size={16} />
        Undo Move
      </button>

      <button
        type="button"
        id="reset-game-btn"
        className="btn btn-primary"
        onClick={onResetGame}
        disabled={isLoading}
      >
        <RotateCcw size={16} />
        Reset Game
      </button>

      <button
        type="button"
        id="reset-scoreboard-btn"
        className="btn btn-outline-danger"
        onClick={onResetScoreboard}
        disabled={isLoading}
      >
        <Trash2 size={16} />
        Reset Scoreboard
      </button>
    </div>
  );
}
