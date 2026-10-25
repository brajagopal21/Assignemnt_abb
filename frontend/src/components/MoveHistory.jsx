import React from 'react';
import { History } from 'lucide-react';

export default function MoveHistory({ moveHistory = [] }) {
  return (
    <aside className="sidebar-panel" aria-label="Move History Panel" id="move-history-panel">
      <div className="panel-header">
        <h2 className="panel-title">
          <History size={18} />
          Move History
        </h2>
        <span className="move-count-badge" id="move-count-badge">
          {moveHistory.length} {moveHistory.length === 1 ? 'Move' : 'Moves'}
        </span>
      </div>

      <div className="history-table-container">
        {moveHistory.length === 0 ? (
          <div className="empty-history" id="empty-history-notice">
            <History size={32} opacity={0.3} />
            <p>No moves yet in this game.</p>
            <span style={{ fontSize: '0.8rem' }}>Click any cell on the board to make the first move.</span>
          </div>
        ) : (
          <table className="history-table" id="move-history-table">
            <thead>
              <tr>
                <th scope="col">Move</th>
                <th scope="col">Player</th>
                <th scope="col">Position</th>
              </tr>
            </thead>
            <tbody>
              {moveHistory.map((item, index) => {
                const isLatest = index === moveHistory.length - 1;
                return (
                  <tr key={index} className={isLatest ? 'latest-move' : ''}>
                    <td><strong>#{item.moveNumber}</strong></td>
                    <td>
                      <span className={`player-tag ${item.player.toLowerCase()}`}>
                        {item.player}
                      </span>
                    </td>
                    <td>{item.position}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </aside>
  );
}
