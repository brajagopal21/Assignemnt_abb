import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, AlertCircle, Sparkles, Swords } from 'lucide-react';
import { api } from './services/api';
import Board from './components/Board';
import Scoreboard from './components/Scoreboard';
import GameModeSelector from './components/GameModeSelector';
import MoveHistory from './components/MoveHistory';
import Controls from './components/Controls';

export default function App() {
  const [gameState, setGameState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize game session on load
  const initGame = useCallback(async (mode = 'two-player') => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.createGame(mode);
      setGameState(data);
    } catch (err) {
      console.error('Failed to create game session:', err);
      setError(err.message || 'Unable to connect to backend server. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initGame('two-player');
  }, [initGame]);

  // Handle cell click
  const handleCellClick = async (cellIndex) => {
    if (!gameState || gameState.status !== 'InProgress' || loading) return;
    if (gameState.board[cellIndex] !== null) return;

    try {
      setLoading(true);
      setError(null);

      const updated = await api.makeMove(gameState.id, {
        player: gameState.currentPlayer,
        cellIndex
      });

      setGameState(updated);

      if (updated.status === 'Won') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Undo
  const handleUndo = async () => {
    if (!gameState || !gameState.canUndo || loading) return;

    try {
      setLoading(true);
      setError(null);
      const updated = await api.undoMove(gameState.id);
      setGameState(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Game
  const handleResetGame = async () => {
    if (!gameState || loading) return;

    try {
      setLoading(true);
      setError(null);
      const updated = await api.resetGame(gameState.id, gameState.mode);
      setGameState(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Reset Scoreboard
  const handleResetScoreboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const newScoreboard = await api.resetScoreboard();
      setGameState(prev => (prev ? { ...prev, scoreboard: newScoreboard } : null));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle switching game mode
  const handleSelectMode = (newMode) => {
    if (gameState && gameState.mode === newMode) return;
    initGame(newMode);
  };

  if (!gameState && loading) {
    return (
      <div className="app-container" style={{ textAlign: 'center', paddingTop: '5rem' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Connecting to backend server...</p>
      </div>
    );
  }

  const {
    board = Array(9).fill(null),
    currentPlayer = 'X',
    mode = 'two-player',
    status = 'InProgress',
    winner = null,
    winningCells = [],
    moveHistory = [],
    canUndo = false,
    scoreboard = { xWins: 0, oWins: 0, draws: 0 }
  } = gameState || {};

  // Status banner display
  let bannerClass = 'status-banner';
  let bannerTitle = '';
  let bannerSub = '';

  if (status === 'Won') {
    bannerClass += winner === 'X' ? ' won-x' : ' won-o';
    bannerTitle = `Player ${winner} Wins!`;
    bannerSub = mode === 'computer' && winner === 'O' 
      ? 'Computer claimed victory! Try again.' 
      : 'Winning combination completed!';
  } else if (status === 'Draw') {
    bannerClass += ' draw';
    bannerTitle = "It's a Draw!";
    bannerSub = 'All cells are filled with no winner.';
  } else {
    bannerTitle = mode === 'computer' 
      ? (currentPlayer === 'X' ? 'Your Turn (Player X)' : 'Computer is thinking...')
      : `Player ${currentPlayer}'s Turn`;
    bannerSub = 'Make your move on the board';
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-badge">
          <Swords size={14} /> Full-Stack REST Edition
        </div>
        <h1>Tic Tac Toe</h1>
        <p>A responsive browser game powered by React and a Node.js REST API</p>
      </header>

      {error && (
        <div className="error-toast" role="alert" id="error-message">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Game Mode Selector */}
      <GameModeSelector
        currentMode={mode}
        onSelectMode={handleSelectMode}
        disabled={loading}
      />

      {/* Scoreboard Cards */}
      <Scoreboard scoreboard={scoreboard} mode={mode} />

      {/* Main Game Layout */}
      <main className="game-layout">
        {/* Game Arena Card */}
        <div className="arena-card">
          <div className={bannerClass} id="status-banner">
            <div className="status-main">
              {status === 'Won' ? (
                <Trophy size={24} color={winner === 'X' ? 'var(--color-x)' : 'var(--color-o)'} />
              ) : status === 'Draw' ? (
                <Sparkles size={24} color="var(--color-draw)" />
              ) : (
                <span className={`player-indicator ${currentPlayer.toLowerCase()}`}>
                  {currentPlayer}
                </span>
              )}
              <span id="game-status-text">{bannerTitle}</span>
            </div>
            <div className="status-subtext" id="game-status-subtext">{bannerSub}</div>
          </div>

          {/* 3x3 Grid */}
          <Board
            board={board}
            winningCells={winningCells}
            isGameCompleted={status !== 'InProgress'}
            onCellClick={handleCellClick}
            isLoading={loading}
          />

          {/* Action Buttons Toolbar */}
          <Controls
            canUndo={canUndo}
            onUndo={handleUndo}
            onResetGame={handleResetGame}
            onResetScoreboard={handleResetScoreboard}
            isLoading={loading}
            gameMode={mode}
          />
        </div>

        {/* Move History Panel */}
        <MoveHistory moveHistory={moveHistory} />
      </main>

      <footer className="footer">
        <p>React Frontend + Node.js REST API Backend • All game rules and state managed on backend</p>
      </footer>
    </div>
  );
}
