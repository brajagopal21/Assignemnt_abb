import express from 'express';
import cors from 'cors';
import { gameStore } from './gameStore.js';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // POST /api/games - Create a new game session
  app.post('/api/games', (req, res) => {
    const { mode } = req.body || {};
    const game = gameStore.createGame(mode);
    res.status(201).json(game);
  });

  // GET /api/games/:id - Get current game state
  app.get('/api/games/:id', (req, res) => {
    const game = gameStore.getGameState(req.params.id);
    if (!game) {
      return res.status(404).json({ error: `Game ${req.params.id} not found` });
    }
    res.json(game);
  });

  // POST /api/games/:id/moves - Submit a player move
  app.post('/api/games/:id/moves', (req, res) => {
    const { player, cellIndex, row, col } = req.body || {};
    const result = gameStore.makeMove(req.params.id, { player, cellIndex, row, col });

    if (result.error) {
      return res.status(result.statusCode || 400).json({ error: result.error });
    }

    res.json(result.data);
  });

  // POST /api/games/:id/undo - Undo last move
  app.post('/api/games/:id/undo', (req, res) => {
    const result = gameStore.undoMove(req.params.id);

    if (result.error) {
      return res.status(result.statusCode || 400).json({ error: result.error });
    }

    res.json(result.data);
  });

  // POST /api/games/:id/reset - Reset the current game
  app.post('/api/games/:id/reset', (req, res) => {
    const { mode } = req.body || {};
    const result = gameStore.resetGame(req.params.id, mode);

    if (result.error) {
      return res.status(result.statusCode || 400).json({ error: result.error });
    }

    res.json(result.data);
  });

  // GET /api/scoreboard - Get scoreboard
  app.get('/api/scoreboard', (req, res) => {
    res.json(gameStore.getScoreboard());
  });

  // POST /api/scoreboard/reset - Reset scoreboard
  app.post('/api/scoreboard/reset', (req, res) => {
    res.json(gameStore.resetScoreboard());
  });

  return app;
}
