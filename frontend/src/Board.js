import React from 'react';
import './Board.css';

function Board({ positions }) {
  const squares = [];
  const cherrySpaces = [15, 30, 45, 60, 75, 90];
  
  for (let i = 1; i <= 100; i++) {
    let isCherry = cherrySpaces.includes(i);
    let player1 = positions[0] === i;
    let player2 = positions[1] === i;
    
    // Determine background color based on position type
    let backgroundColor = '#f8f9fa';
    let borderColor = '#dee2e6';
    let borderWidth = '1px';
    let className = 'board-square';
    
    if (isCherry) {
      backgroundColor = '#ffe6f2';
      borderColor = '#e91e63';
      borderWidth = '2px';
      className += ' cherry-space';
    } else if (i === 100) {
      backgroundColor = '#e8f5e8';
      borderColor = '#4caf50';
      borderWidth = '2px';
      className += ' finish-space';
    } else if (i === 1) {
      backgroundColor = '#e3f2fd';
      borderColor = '#2196f3';
      borderWidth = '2px';
      className += ' start-space';
    }
    
    if (player1) className += ' player1-here';
    if (player2) className += ' player2-here';
    
    squares.push(
      <div
        key={i}
        className={className}
        style={{
          background: backgroundColor,
          border: `${borderWidth} solid ${borderColor}`,
          animationDelay: `${i * 0.01}s`
        }}
      >
        {isCherry && (
          <div className="cherry-icon">
            🍒
          </div>
        )}
        
        {i === 100 && (
          <div className="finish-icon">
            🏆
          </div>
        )}
        
        {i === 1 && (
          <div className="start-icon">
            🚀
          </div>
        )}
        
        {player1 && (
          <div className="player-token player1-token">
            P1
          </div>
        )}
        
        {player2 && (
          <div className="player-token player2-token">
            P2
          </div>
        )}
        
        <div className="square-number">
          {i}
        </div>
      </div>
    );
  }
  
  return (
    <div className="board-container">
      <div className="board-legend">
        <span className="legend-item cherry-legend">🍒 Cherry Bonus Spaces</span>
        <span className="legend-separator">|</span>
        <span className="legend-item finish-legend">🏆 Finish Line</span>
        <span className="legend-separator">|</span>
        <span className="legend-item start-legend">🚀 Start Line</span>
      </div>
      <div className="board-grid">
        {squares}
      </div>
    </div>
  );
}

export default Board;