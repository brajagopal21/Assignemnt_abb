import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { checkGameState, getComputerMove, WINNING_LINES } from '../src/gameLogic.js';
import { createApp } from '../src/app.js';
import { gameStore } from '../src/gameStore.js';

test('Game Logic - Pure functions', async (t) => {
  await t.test('detects Row win correctly', () => {
    // Top row win
    const board = ['X', 'X', 'X', null, null, null, null, null, null];
    const res = checkGameState(board);
    assert.equal(res.status, 'Won');
    assert.equal(res.winner, 'X');
    assert.deepEqual(res.winningCells, [0, 1, 2]);
  });

  await t.test('detects Column win correctly', () => {
    // Middle column win
    const board = [null, 'O', null, null, 'O', null, null, 'O', null];
    const res = checkGameState(board);
    assert.equal(res.status, 'Won');
    assert.equal(res.winner, 'O');
    assert.deepEqual(res.winningCells, [1, 4, 7]);
  });

  await t.test('detects Diagonal win correctly', () => {
    // Diagonal top-left to bottom-right
    const board = ['X', null, null, null, 'X', null, null, null, 'X'];
    const res = checkGameState(board);
    assert.equal(res.status, 'Won');
    assert.equal(res.winner, 'X');
    assert.deepEqual(res.winningCells, [0, 4, 8]);

    // Diagonal top-right to bottom-left
    const board2 = [null, null, 'O', null, 'O', null, 'O', null, null];
    const res2 = checkGameState(board2);
    assert.equal(res2.status, 'Won');
    assert.equal(res2.winner, 'O');
    assert.deepEqual(res2.winningCells, [2, 4, 6]);
  });

  await t.test('detects Draw correctly when 9 cells filled and no winner', () => {
    const board = [
      'X', 'O', 'X',
      'X', 'O', 'O',
      'O', 'X', 'X'
    ];
    const res = checkGameState(board);
    assert.equal(res.status, 'Draw');
    assert.equal(res.winner, null);
    assert.deepEqual(res.winningCells, []);
  });

  await t.test('Computer move priority 1: Plays winning move for O if available', () => {
    // O has cells 0, 1; cell 2 is empty -> O must take 2
    const board = [
      'O', 'O', null,
      'X', 'X', null,
      null, null, null
    ];
    const move = getComputerMove(board);
    assert.equal(move, 2);
  });

  await t.test('Computer move priority 2: Blocks X if X can win next', () => {
    // X has cells 3, 4; cell 5 is empty -> O must block at 5
    const board = [
      'O', null, null,
      'X', 'X', null,
      null, null, null
    ];
    const move = getComputerMove(board);
    assert.equal(move, 5);
  });

  await t.test('Computer move priority 3: Takes center if available', () => {
    // X played at corner 0, center (4) is available
    const board = [
      'X', null, null,
      null, null, null,
      null, null, null
    ];
    const move = getComputerMove(board);
    assert.equal(move, 4);
  });

  await t.test('Computer move priority 4: Takes corner if center occupied', () => {
    // X took center (4), computer should take first available corner (0)
    const board = [
      null, null, null,
      null, 'X', null,
      null, null, null
    ];
    const move = getComputerMove(board);
    assert.equal(move, 0); // Corner 0 is free
  });

  await t.test('Computer move priority 5: Takes any available cell when center and corners taken', () => {
    // Corners 0, 2, 6, 8 and Center 4 taken
    const board = [
      'X', null, 'O',
      null, 'X', null,
      'O', null, 'X'
    ];
    const move = getComputerMove(board);
    // Should take first empty edge cell (1)
    assert.equal(move, 1);
  });
});

test('Backend API - Integration & Rules', async (t) => {
  const app = createApp();

  // Reset scoreboard before test suite
  gameStore.resetScoreboard();

  await t.test('POST /api/games creates a new game session with default two-player mode', async () => {
    const res = await request(app)
      .post('/api/games')
      .send({ mode: 'two-player' })
      .expect(201);

    assert.ok(res.body.id);
    assert.equal(res.body.currentPlayer, 'X');
    assert.equal(res.body.mode, 'two-player');
    assert.equal(res.body.status, 'InProgress');
    assert.deepEqual(res.body.board, Array(9).fill(null));
    assert.deepEqual(res.body.moveHistory, []);
  });

  await t.test('Valid move and Turn switching in two-player mode', async () => {
    const game = gameStore.createGame('two-player');

    // Move 1: X plays at index 0 (Row 1, Column 1)
    const res1 = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'X', cellIndex: 0 })
      .expect(200);

    assert.equal(res1.body.board[0], 'X');
    assert.equal(res1.body.currentPlayer, 'O'); // Switched to O
    assert.equal(res1.body.moveHistory.length, 1);
    assert.equal(res1.body.moveHistory[0].position, 'Row 1, Column 1');

    // Move 2: O plays at index 4 (Row 2, Column 2)
    const res2 = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'O', cellIndex: 4 })
      .expect(200);

    assert.equal(res2.body.board[4], 'O');
    assert.equal(res2.body.currentPlayer, 'X'); // Switched back to X
    assert.equal(res2.body.moveHistory.length, 2);
  });

  await t.test('Rejects Invalid Moves: occupied cell, out of bounds, wrong player', async () => {
    const game = gameStore.createGame('two-player');

    // X plays at index 0
    await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'X', cellIndex: 0 })
      .expect(200);

    // Wrong player: X tries to move again when it's O's turn
    const resWrongPlayer = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'X', cellIndex: 1 })
      .expect(400);
    assert.match(resWrongPlayer.body.error, /It is Player O's turn/);

    // Occupied cell: O tries to move at index 0
    const resOccupied = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'O', cellIndex: 0 })
      .expect(400);
    assert.match(resOccupied.body.error, /already occupied/);

    // Out of bounds: O tries index 99
    const resOutOfBounds = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'O', cellIndex: 99 })
      .expect(400);
    assert.match(resOutOfBounds.body.error, /out of bounds/);
  });

  await t.test('Win detection, scoreboard update, and preventing move after completion', async () => {
    const game = gameStore.createGame('two-player');
    const startScoreboard = gameStore.getScoreboard();

    // Sequence for X to win top row:
    // X at 0, O at 3
    // X at 1, O at 4
    // X at 2 (X wins)
    await request(app).post(`/api/games/${game.id}/moves`).send({ player: 'X', cellIndex: 0 }).expect(200);
    await request(app).post(`/api/games/${game.id}/moves`).send({ player: 'O', cellIndex: 3 }).expect(200);
    await request(app).post(`/api/games/${game.id}/moves`).send({ player: 'X', cellIndex: 1 }).expect(200);
    await request(app).post(`/api/games/${game.id}/moves`).send({ player: 'O', cellIndex: 4 }).expect(200);

    const winRes = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'X', cellIndex: 2 })
      .expect(200);

    assert.equal(winRes.body.status, 'Won');
    assert.equal(winRes.body.winner, 'X');
    assert.deepEqual(winRes.body.winningCells, [0, 1, 2]);

    // Check scoreboard updated
    const afterScoreboard = gameStore.getScoreboard();
    assert.equal(afterScoreboard.xWins, startScoreboard.xWins + 1);

    // Move after completion must be rejected
    const completedMoveRes = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'O', cellIndex: 8 })
      .expect(400);
    assert.match(completedMoveRes.body.error, /already completed/);
  });

  await t.test('Draw detection and scoreboard update', async () => {
    const game = gameStore.createGame('two-player');
    const startScoreboard = gameStore.getScoreboard();

    // Board configuration ending in a draw:
    // X(0) O(1) X(2)
    // X(3) O(4) O(5)
    // O(6) X(7) X(8)
    const moves = [
      { p: 'X', c: 0 },
      { p: 'O', c: 1 },
      { p: 'X', c: 2 },
      { p: 'O', c: 4 },
      { p: 'X', c: 3 },
      { p: 'O', c: 5 },
      { p: 'X', c: 7 },
      { p: 'O', c: 6 },
      { p: 'X', c: 8 }
    ];

    let lastRes;
    for (const m of moves) {
      lastRes = await request(app)
        .post(`/api/games/${game.id}/moves`)
        .send({ player: m.p, cellIndex: m.c })
        .expect(200);
    }

    assert.equal(lastRes.body.status, 'Draw');
    assert.equal(lastRes.body.winner, null);

    const afterScoreboard = gameStore.getScoreboard();
    assert.equal(afterScoreboard.draws, startScoreboard.draws + 1);
  });

  await t.test('Reset Game clears board and history while preserving scoreboard', async () => {
    const game = gameStore.createGame('two-player');
    await request(app).post(`/api/games/${game.id}/moves`).send({ player: 'X', cellIndex: 0 }).expect(200);

    const scoreboardBeforeReset = gameStore.getScoreboard();

    const resetRes = await request(app)
      .post(`/api/games/${game.id}/reset`)
      .expect(200);

    assert.deepEqual(resetRes.body.board, Array(9).fill(null));
    assert.equal(resetRes.body.currentPlayer, 'X');
    assert.equal(resetRes.body.status, 'InProgress');
    assert.deepEqual(resetRes.body.moveHistory, []);

    // Scoreboard remains intact
    const scoreboardAfterReset = gameStore.getScoreboard();
    assert.deepEqual(scoreboardAfterReset, scoreboardBeforeReset);
  });

  await t.test('Undo in two-player mode removes single last move and restores turn', async () => {
    const game = gameStore.createGame('two-player');

    // Move 1: X plays at 0
    await request(app).post(`/api/games/${game.id}/moves`).send({ player: 'X', cellIndex: 0 }).expect(200);
    // Move 2: O plays at 4
    await request(app).post(`/api/games/${game.id}/moves`).send({ player: 'O', cellIndex: 4 }).expect(200);

    // Undo: should remove O's move at 4, leave X's move at 0, and make it O's turn
    const undoRes = await request(app)
      .post(`/api/games/${game.id}/undo`)
      .expect(200);

    assert.equal(undoRes.body.board[4], null);
    assert.equal(undoRes.body.board[0], 'X');
    assert.equal(undoRes.body.currentPlayer, 'O');
    assert.equal(undoRes.body.moveHistory.length, 1);
  });

  await t.test('Computer mode: automatic move and Undo removes move pair (O + X)', async () => {
    const game = gameStore.createGame('computer');

    // Human X plays at corner 0
    const moveRes = await request(app)
      .post(`/api/games/${game.id}/moves`)
      .send({ player: 'X', cellIndex: 0 })
      .expect(200);

    // Both X and computer O have moved!
    assert.equal(moveRes.body.board[0], 'X');
    // Computer should have taken center (4) per priority 3 (center available)
    assert.equal(moveRes.body.board[4], 'O');
    assert.equal(moveRes.body.moveHistory.length, 2);
    assert.equal(moveRes.body.currentPlayer, 'X');

    // Undo in Computer Mode: Both O's move and X's move are removed together
    const undoRes = await request(app)
      .post(`/api/games/${game.id}/undo`)
      .expect(200);

    assert.equal(undoRes.body.board[0], null);
    assert.equal(undoRes.body.board[4], null);
    assert.equal(undoRes.body.moveHistory.length, 0);
    assert.equal(undoRes.body.currentPlayer, 'X');
  });

  await t.test('Scoreboard API endpoints: GET and POST /reset', async () => {
    const getRes = await request(app).get('/api/scoreboard').expect(200);
    assert.ok(typeof getRes.body.xWins === 'number');

    const resetRes = await request(app).post('/api/scoreboard/reset').expect(200);
    assert.deepEqual(resetRes.body, { xWins: 0, oWins: 0, draws: 0 });
  });
});
