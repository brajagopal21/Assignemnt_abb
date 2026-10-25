import React from 'react';
import { Users, Bot } from 'lucide-react';

export default function GameModeSelector({ currentMode, onSelectMode, disabled }) {
  return (
    <div className="mode-selector" id="game-mode-selector">
      <div className="mode-pills" role="radiogroup" aria-label="Game Mode">
        <button
          type="button"
          id="mode-two-player-btn"
          role="radio"
          aria-checked={currentMode === 'two-player'}
          className={`mode-pill-btn ${currentMode === 'two-player' ? 'active' : ''}`}
          onClick={() => onSelectMode('two-player')}
          disabled={disabled}
        >
          <Users size={18} />
          Two Player Mode
        </button>
        <button
          type="button"
          id="mode-computer-btn"
          role="radio"
          aria-checked={currentMode === 'computer'}
          className={`mode-pill-btn ${currentMode === 'computer' ? 'active' : ''}`}
          onClick={() => onSelectMode('computer')}
          disabled={disabled}
        >
          <Bot size={18} />
          Play Against Computer
        </button>
      </div>
    </div>
  );
}
