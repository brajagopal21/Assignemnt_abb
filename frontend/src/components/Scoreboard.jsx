import React from 'react';
import { Trophy, Users, ShieldAlert } from 'lucide-react';

export default function Scoreboard({ scoreboard, mode }) {
  const { xWins = 0, oWins = 0, draws = 0 } = scoreboard || {};

  return (
    <section className="scoreboard-section" aria-label="Game Scoreboard" id="scoreboard">
      <div className="score-card player-x" id="score-card-x">
        <div className="score-icon-wrap">
          X
        </div>
        <div className="score-info">
          <div className="score-label">Player X {mode === 'computer' ? '(Human)' : ''}</div>
          <div className="score-value" id="score-x-val">{xWins}</div>
        </div>
      </div>

      <div className="score-card player-o" id="score-card-o">
        <div className="score-icon-wrap">
          O
        </div>
        <div className="score-info">
          <div className="score-label">Player O {mode === 'computer' ? '(Computer)' : ''}</div>
          <div className="score-value" id="score-o-val">{oWins}</div>
        </div>
      </div>

      <div className="score-card draws" id="score-card-draws">
        <div className="score-icon-wrap">
          =
        </div>
        <div className="score-info">
          <div className="score-label">Draws</div>
          <div className="score-value" id="score-draws-val">{draws}</div>
        </div>
      </div>
    </section>
  );
}
