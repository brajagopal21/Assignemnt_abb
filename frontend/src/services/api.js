const API_BASE = import.meta.env.VITE_API_URL || '/api';

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}: ${response.statusText}`;
    throw new Error(errorMsg);
  }
  return data;
}

export const api = {
  async createGame(mode = 'two-player') {
    const res = await fetch(`${API_BASE}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    return handleResponse(res);
  },

  async getGame(id) {
    const res = await fetch(`${API_BASE}/games/${id}`);
    return handleResponse(res);
  },

  async makeMove(id, { player, cellIndex, row, col }) {
    const res = await fetch(`${API_BASE}/games/${id}/moves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player, cellIndex, row, col })
    });
    return handleResponse(res);
  },

  async undoMove(id) {
    const res = await fetch(`${API_BASE}/games/${id}/undo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  },

  async resetGame(id, mode) {
    const res = await fetch(`${API_BASE}/games/${id}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    return handleResponse(res);
  },

  async getScoreboard() {
    const res = await fetch(`${API_BASE}/scoreboard`);
    return handleResponse(res);
  },

  async resetScoreboard() {
    const res = await fetch(`${API_BASE}/scoreboard/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(res);
  }
};
