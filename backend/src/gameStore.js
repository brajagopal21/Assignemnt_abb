import { checkGameState, normalizeCellIndex, formatPosition, getComputerMove } from './gameLogic.js';

class GameStore {
  constructor() {
    this.games = new Map();
    this.nextGameId = 1;
    this.scoreboard = {
      xWins: 0,
      oWins: 0,
      draws: 0
    };
  }

  getScoreboard() {
    return { ...this.scoreboard };
  }

  resetScoreboard() {
    this.scoreboard = {
      xWins: 0,
      oWins: 0,
      draws: 0
    };
    return this.getScoreboard();
  }

  createGame(mode = 'two-player') {
    const id = String(this.nextGameId++);
    const validMode = (mode === 'computer') ? 'computer' : 'two-player';

    const game = {
      id,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      mode: validMode,
      status: 'InProgress', // 'InProgress' | 'Won' | 'Draw'
      winner: null,         // 'X' | 'O' | null
      winningCells: [],     // number[]
      moveHistory: [],      // array of { moveNumber, player, position, cellIndex, row, col }
      scoreboardUpdated: false
    };

    this.games.set(id, game);
    return this.getGameState(id);
  }

  getGame(id) {
    return this.games.get(String(id)) || null;
  }

  getGameState(id) {
    const game = this.getGame(id);
    if (!game) return null;

    return {
      id: game.id,
      board: [...game.board],
      currentPlayer: game.currentPlayer,
      mode: game.mode,
      status: game.status,
      winner: game.winner,
      winningCells: [...game.winningCells],
      moveHistory: [...game.moveHistory],
      canUndo: game.status === 'InProgress' && game.moveHistory.length > 0,
      scoreboard: this.getScoreboard()
    };
  }

  _recordWinOrDraw(game) {
    if (game.scoreboardUpdated) return;

    if (game.status === 'Won') {
      if (game.winner === 'X') {
        this.scoreboard.xWins += 1;
      } else if (game.winner === 'O') {
        this.scoreboard.oWins += 1;
      }
      game.scoreboardUpdated = true;
    } else if (game.status === 'Draw') {
      this.scoreboard.draws += 1;
      game.scoreboardUpdated = true;
    }
  }

  makeMove(id, { player, cellIndex, row, col }) {
    const game = this.getGame(id);
    if (!game) {
      return { error: 'Game not found', statusCode: 404 };
    }

    // 1. Move after completion
    if (game.status !== 'InProgress') {
      return { error: 'Move not allowed: game is already completed', statusCode: 400 };
    }

    // 2. Turn validation
    if (!player || player.toUpperCase() !== game.currentPlayer) {
      return {
        error: `Invalid move: It is Player ${game.currentPlayer}'s turn, received Player ${player || 'undefined'}`,
        statusCode: 400
      };
    }

    const normalizedPlayer = player.toUpperCase();

    // 3. Coordinate validation
    const index = normalizeCellIndex({ cellIndex, row, col });
    if (index < 0 || index > 8) {
      return { error: 'Move position is out of bounds (must be between 0 and 8)', statusCode: 400 };
    }

    // 4. Occupied cell validation
    if (game.board[index] !== null) {
      return { error: `Cell at position ${formatPosition(index)} is already occupied`, statusCode: 400 };
    }

    // Apply human move
    game.board[index] = normalizedPlayer;
    const moveNumber = game.moveHistory.length + 1;
    const r = Math.floor(index / 3) + 1;
    const c = (index % 3) + 1;

    game.moveHistory.push({
      moveNumber,
      player: normalizedPlayer,
      position: formatPosition(index),
      cellIndex: index,
      row: r,
      col: c
    });

    // Check game state after human move
    const stateAfterMove = checkGameState(game.board);
    game.status = stateAfterMove.status;
    game.winner = stateAfterMove.winner;
    game.winningCells = stateAfterMove.winningCells;

    if (game.status !== 'InProgress') {
      this._recordWinOrDraw(game);
      return { data: this.getGameState(id) };
    }

    // Next turn
    game.currentPlayer = (normalizedPlayer === 'X') ? 'O' : 'X';

    // If Computer Mode, execute computer's move automatically
    if (game.mode === 'computer' && game.currentPlayer === 'O') {
      const compCell = getComputerMove(game.board);
      if (compCell !== -1) {
        game.board[compCell] = 'O';
        const compMoveNumber = game.moveHistory.length + 1;
        const compR = Math.floor(compCell / 3) + 1;
        const compC = (compCell % 3) + 1;

        game.moveHistory.push({
          moveNumber: compMoveNumber,
          player: 'O',
          position: formatPosition(compCell),
          cellIndex: compCell,
          row: compR,
          col: compC
        });

        const stateAfterComp = checkGameState(game.board);
        game.status = stateAfterComp.status;
        game.winner = stateAfterComp.winner;
        game.winningCells = stateAfterComp.winningCells;

        if (game.status !== 'InProgress') {
          this._recordWinOrDraw(game);
        } else {
          game.currentPlayer = 'X';
        }
      }
    }

    return { data: this.getGameState(id) };
  }

  undoMove(id) {
    const game = this.getGame(id);
    if (!game) {
      return { error: 'Game not found', statusCode: 404 };
    }

    // Option A: Disable undo after completion
    if (game.status !== 'InProgress') {
      return { error: 'Undo is disabled once a game has been won or drawn', statusCode: 400 };
    }

    if (game.moveHistory.length === 0) {
      return { error: 'No moves to undo', statusCode: 400 };
    }

    if (game.mode === 'two-player') {
      // Undo 1 move
      const lastMove = game.moveHistory.pop();
      game.board[lastMove.cellIndex] = null;
      game.currentPlayer = lastMove.player;
    } else if (game.mode === 'computer') {
      // In computer mode: Undo removes the computer's last move ('O') and human's previous move ('X') together
      const lastMove = game.moveHistory[game.moveHistory.length - 1];
      if (lastMove && lastMove.player === 'O') {
        const compMove = game.moveHistory.pop();
        game.board[compMove.cellIndex] = null;
      }

      if (game.moveHistory.length > 0) {
        const humanMove = game.moveHistory.pop();
        game.board[humanMove.cellIndex] = null;
      }

      game.currentPlayer = 'X';
    }

    // Game is back in progress
    const recalculated = checkGameState(game.board);
    game.status = recalculated.status;
    game.winner = recalculated.winner;
    game.winningCells = recalculated.winningCells;

    return { data: this.getGameState(id) };
  }

  resetGame(id, newMode = null) {
    const game = this.getGame(id);
    if (!game) {
      return { error: 'Game not found', statusCode: 404 };
    }

    game.board = Array(9).fill(null);
    game.currentPlayer = 'X';
    game.status = 'InProgress';
    game.winner = null;
    game.winningCells = [];
    game.moveHistory = [];
    game.scoreboardUpdated = false;

    if (newMode === 'two-player' || newMode === 'computer') {
      game.mode = newMode;
    }

    return { data: this.getGameState(id) };
  }
}

export const gameStore = new GameStore();
