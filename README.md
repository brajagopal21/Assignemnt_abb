# ⚔️ Tic Tac Toe Pro (Full-Stack Web Application)

A modern, responsive, browser-based Tic Tac Toe application built with a **React.js** frontend and a **Node.js (Express)** REST API backend. The application features two player modes (Two-Player & AI Computer Opponent), move history tracking, smart undo logic, and a session-level scoreboard.

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Features Implemented](#3-features-implemented)
4. [How to Run the Backend Locally](#4-how-to-run-the-backend-locally)
5. [How to Run the Frontend Locally](#5-how-to-run-the-frontend-locally)
6. [API Endpoint Summary](#6-api-endpoint-summary)
7. [How to Run Tests](#7-how-to-run-tests)
8. [AI Tools and Prompt Summary](#8-ai-tools-and-prompt-summary)
9. [Design Decisions](#9-design-decisions)
10. [Clarifications and Assumptions](#10-clarifications-and-assumptions)
11. [Known Limitations](#11-known-limitations)
12. [Future Improvements](#12-future-improvements)

---

## 1. Project Overview

This project implements a full-stack Tic Tac Toe game designed to be clean, modular, and easy for review and discussion.
The application separates concerns cleanly:
- **Backend (Node.js REST API)**: The single source of truth for game rules, move validation, game session state, computer AI decision-making, and session scoreboard.
- **Frontend (React.js + Vite)**: A reactive, accessible, and polished user interface that calls the backend REST API for all game actions and displays board state, move history, and score metrics with animations.

---

## 2. Tech Stack

- **Frontend**:
  - React 19 + JavaScript / JSX
  - Vite (Fast modern build tool & development server)
  - Vanilla CSS Design System with dark glassmorphic theme and smooth micro-animations
  - `lucide-react` (icons)
  - `canvas-confetti` (victory celebration effect)
  - Vitest + React Testing Library (frontend unit tests)
- **Backend**:
  - Node.js (v20+ / v24)
  - Express.js (REST API framework)
  - CORS middleware
  - Node.js native test runner (`node --test`) & `supertest` (integration tests)
- **Architecture**:
  - Client-Server Architecture over HTTP / JSON REST APIs.
  - In-memory state store (`GameStore`) managing concurrent sessions and session scoreboard.

---

## 3. Features Implemented

### 🎮 Functional Highlights
1. **Interactive 3x3 Game Board**:
   - Each cell is clickable when empty.
   - Distinct, glowing visual marks for Player X (Neon Cyan) and Player O (Neon Rose).
   - Occupied cells and completed game boards lock against further moves.
2. **Turn Management**:
   - Explicit turn indicator banner showing whose turn it is (`Player X` or `Player O`).
   - Turns strictly alternate after every valid move.
   - Invalid moves are rejected by the backend without altering the turn.
3. **Win & Draw Detection**:
   - Detects all 8 winning lines: 3 rows, 3 columns, and 2 diagonals.
   - Highlights the 3 winning cells with an animated pulse effect.
   - Draw detection triggers when all 9 cells are filled with no winner.
   - Prevents additional moves once a game is won or drawn.
4. **Move History**:
   - Real-time tabular log displaying:
     - Move Number (`#1`, `#2`, etc.)
     - Player (`X` or `O` with distinct badges)
     - Board Position formatted as `Row X, Column Y` (e.g., `Row 1, Column 1`).
   - Highlights the latest move made.
5. **Smart Undo Last Move**:
   - **Two Player Mode**: Reverts the single most recent move, restores the previous player's turn, and clears that board cell.
   - **Computer Mode**: Reverts both the computer's last move (`O`) and the human player's previous move (`X`) together, setting the turn back to human player `X`.
   - Disabled when no moves exist or when a game has concluded (Option A).
6. **Session-Level Scoreboard**:
   - Tracks **X Wins**, **O Wins**, and **Draws**.
   - Increments exactly once per completed game.
   - Preserved across **Reset Game** actions.
   - Can be independently reset via the **Reset Scoreboard** button.
7. **Rule-Based Computer Opponent (AI)**:
   - Plays automatically as `O` after human `X` makes a move.
   - Follows the exact 5-tier priority hierarchy:
     1. If O can win, play the winning move.
     2. If X can win next, block X.
     3. Take center cell (`Row 2, Column 2` / index 4) if available.
     4. Take first available corner cell (`0`, `2`, `6`, or `8`).
     5. Take any remaining empty cell.

---

## 4. How to Run the Backend Locally

### Prerequisites
- Node.js (v18, v20, or v24 installed)
- npm (v9+)

### Steps
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```
   *Or for development with automatic reload:*
   ```bash
   npm run dev
   ```
4. The backend REST API will start at:
   ```
   http://localhost:5001
   ```
   Health check: `http://localhost:5001/api/health`

---

## 5. How to Run the Frontend Locally

### Steps
1. Open a new terminal tab and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies (if not already installed):
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```
   *(Vite is configured to proxy `/api` requests automatically to `http://localhost:5001`)*

---

## 6. API Endpoint Summary

All backend endpoints use JSON for request and response payloads.

| Method | Endpoint | Description | Request Body Example | Response Code |
|---|---|---|---|---|
| `POST` | `/api/games` | Create a new game session | `{ "mode": "two-player" }` or `{ "mode": "computer" }` | 201 Created |
| `GET` | `/api/games/:id` | Get current state of game session | None | 200 OK / 404 |
| `POST` | `/api/games/:id/moves` | Submit player move | `{ "player": "X", "cellIndex": 4 }` (also accepts `{ "player": "X", "row": 2, "col": 2 }`) | 200 OK / 400 Bad Request |
| `POST` | `/api/games/:id/undo` | Undo last move according to game mode | None | 200 OK / 400 Bad Request |
| `POST` | `/api/games/:id/reset` | Reset current board & moves (keeps scoreboard) | `{ "mode": "two-player" }` (optional) | 200 OK |
| `GET` | `/api/scoreboard` | Retrieve session scoreboard | None | 200 OK |
| `POST` | `/api/scoreboard/reset` | Reset scoreboard to zeros | None | 200 OK |
| `GET` | `/api/health` | Service health check | None | 200 OK |

### Sample Game State Response:
```json
{
  "id": "1",
  "board": ["X", null, null, null, "O", null, null, null, null],
  "currentPlayer": "X",
  "mode": "computer",
  "status": "InProgress",
  "winner": null,
  "winningCells": [],
  "moveHistory": [
    {
      "moveNumber": 1,
      "player": "X",
      "position": "Row 1, Column 1",
      "cellIndex": 0,
      "row": 1,
      "col": 1
    },
    {
      "moveNumber": 2,
      "player": "O",
      "position": "Row 2, Column 2",
      "cellIndex": 4,
      "row": 2,
      "col": 2
    }
  ],
  "canUndo": true,
  "scoreboard": {
    "xWins": 0,
    "oWins": 0,
    "draws": 0
  }
}
```

---

## 7. How to Run Tests

### Running Backend Unit & Integration Tests:
Run the 20 automated tests verifying game logic, win conditions, AI decision tiers, undo logic, validation errors, and scoreboard persistence:
```bash
cd backend
npm test
```

### Running Frontend Component Tests:
```bash
cd frontend
npm test
```

---

## 8. AI Tools and Prompt Summary

### AI Tools Used
- Antigravity AI Agent with Google DeepMind LLM.

### Key Prompt Workflow & Evolution
1. **Specification Analysis**: Converted the assignment brief into strict backend validation criteria, state modeling, and API endpoints.
2. **Environment Adaptation**:
   - The original prompt mentioned Angular + .NET; however, the user's local machine lacked the .NET SDK (`command not found: dotnet`) and specifically requested:
     `"build frontend reeactjs and backend in nodejs do it simply"`.
   - Adapted the architecture seamlessly to Node.js (Express) + React (Vite) while preserving 100% of the functional rules, API schemas, and test requirements.
3. **Automated Verification**: Generated unit tests first for edge cases (out of bounds, wrong turn, AI priorities 1-5, undo pair in computer mode) to ensure regression-free development.

### What Was Handled & Reviewed Carefully:
- **Computer AI Priority**: Ensured the computer strictly prioritizes winning moves for `O`, then blocks `X`, then grabs center (`4`), then corners (`0, 2, 6, 8`), then any open cell.
- **Atomic Undo in Computer Mode**: Reverting both the computer's response and the human move in a single click so the player is never left facing a dangling computer move.
- **Scoreboard Idempotency**: Verified that scoreboard updates occur exactly once upon game conclusion and are never falsely incremented on repeated requests.

---

## 9. Design Decisions

1. **Backend as Source of Truth**:
   The frontend is purely a presentation and interaction layer. All game rule enforcement, win checks, computer AI decisions, and score updates happen on the backend.
2. **Option A for Completed Game Undo**:
   Per Clarification 2 in the specification, **Option A: Disable Undo After Completion** was selected. Once a game is won or drawn, the outcome and scoreboard remain final for that round. Players can click **Reset Game** to immediately start a fresh round.
3. **Pure Function Game Logic**:
   Separated `gameLogic.js` (pure stateless functions) from `gameStore.js` (session state management) to achieve maximum testability and clean separation of concerns.
4. **Vite Proxy for Zero-CORS Friction**:
   Configured Vite's dev server to proxy `/api` requests to port `5001`, eliminating CORS complexity during local review while still supporting direct CORS calls.

---

## 10. Clarifications and Assumptions

1. **Clarification 2 Choice (Scoreboard & Undo)**:
   - **Choice**: Option A (Disable Undo After Completion).
   - **Rationale**: Prevents ambiguous score retraction states and provides a clean, standard competitive gaming flow.
2. **Move Position Format**:
   - Human-readable 1-indexed coordinates (`Row 1, Column 1` through `Row 3, Column 3`) are logged in the Move History table, while 0-indexed values (`0` to `8`) are preserved for board array indexing.
3. **Stack Substitution**:
   - React.js frontend + Node.js backend was implemented per user's explicit directive and local machine environment (Node 24 present, .NET absent).

---

## 11. Known Limitations

- **Session In-Memory Persistence**: Sessions and scoreboard are stored in memory (`GameStore`). Restarting the Node server resets the sessions and scoreboard. For production scale, an external Redis cache or SQLite database can be plugged in without changing the API contract.
- **Local Machine Single-Instance**: Multiple browser tabs in the same session can play independently by initializing unique game session IDs.

---

## 12. Future Improvements

1. **Persistent SQLite / PostgreSQL Storage**: Persist game records and global leaderboards.
2. **Real-time WebSockets / SSE**: Allow two players on different devices/browsers to play against each other in real-time.
3. **Variable Board Dimensions (4x4, 5x5)**: Support configurable grid sizes and customizable winning streaks.
4. **Sound Effects**: Add optional audio cues for clicks, wins, and draws with a mute toggle.

---

### Author & Reviewer Note
The application is self-contained, lightweight, and starts in seconds. All 20 tests pass out-of-the-box.
