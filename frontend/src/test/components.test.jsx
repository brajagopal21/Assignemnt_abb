import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Board from '../components/Board';
import Scoreboard from '../components/Scoreboard';
import MoveHistory from '../components/MoveHistory';
import Controls from '../components/Controls';
import GameModeSelector from '../components/GameModeSelector';

describe('Frontend Components', () => {
  it('Scoreboard renders player wins and draws accurately', () => {
    const scoreboard = { xWins: 3, oWins: 2, draws: 1 };
    render(<Scoreboard scoreboard={scoreboard} mode="two-player" />);

    expect(screen.getByText('Player X')).toBeInTheDocument();
    expect(screen.getByText('Player O')).toBeInTheDocument();
    expect(screen.getByText('Draws')).toBeInTheDocument();

    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('Board renders 9 cells and handles clicks', () => {
    const mockBoard = ['X', 'O', null, null, null, null, null, null, null];
    const handleClick = vi.fn();

    render(
      <Board
        board={mockBoard}
        winningCells={[]}
        isGameCompleted={false}
        onCellClick={handleClick}
        isLoading={false}
      />
    );

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(9);

    // Click third cell (empty)
    fireEvent.click(cells[2]);
    expect(handleClick).toHaveBeenCalledWith(2);

    // First cell already occupied by X -> disabled
    expect(cells[0]).toBeDisabled();
  });

  it('MoveHistory displays all moves with number, player and position', () => {
    const history = [
      { moveNumber: 1, player: 'X', position: 'Row 1, Column 1' },
      { moveNumber: 2, player: 'O', position: 'Row 2, Column 2' }
    ];

    render(<MoveHistory moveHistory={history} />);

    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('Row 1, Column 1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('Row 2, Column 2')).toBeInTheDocument();
  });

  it('Controls triggers undo, reset game, and reset scoreboard', () => {
    const onUndo = vi.fn();
    const onResetGame = vi.fn();
    const onResetScoreboard = vi.fn();

    render(
      <Controls
        canUndo={true}
        onUndo={onUndo}
        onResetGame={onResetGame}
        onResetScoreboard={onResetScoreboard}
        isLoading={false}
        gameMode="two-player"
      />
    );

    const undoBtn = screen.getByRole('button', { name: /undo move/i });
    const resetGameBtn = screen.getByRole('button', { name: /reset game/i });
    const resetScoreboardBtn = screen.getByRole('button', { name: /reset scoreboard/i });

    expect(undoBtn).not.toBeDisabled();
    fireEvent.click(undoBtn);
    expect(onUndo).toHaveBeenCalledTimes(1);

    fireEvent.click(resetGameBtn);
    expect(onResetGame).toHaveBeenCalledTimes(1);

    fireEvent.click(resetScoreboardBtn);
    expect(onResetScoreboard).toHaveBeenCalledTimes(1);
  });

  it('GameModeSelector allows selecting computer mode', () => {
    const onSelectMode = vi.fn();
    render(<GameModeSelector currentMode="two-player" onSelectMode={onSelectMode} disabled={false} />);

    const computerBtn = screen.getByRole('radio', { name: /play against computer/i });
    fireEvent.click(computerBtn);
    expect(onSelectMode).toHaveBeenCalledWith('computer');
  });
});
