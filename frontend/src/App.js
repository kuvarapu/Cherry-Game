import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Board from './Board';
import Login from './Login';
import GameMenu from './GameMenu';
import './App.css';

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [game, setGame] = useState(null);
  const [dice, setDice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [showDice, setShowDice] = useState(false);

  // Poll for game updates when playing against computer
  useEffect(() => {
    let interval;
    if (game && game.mode === 'pvc' && !game.finished) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`http://localhost:4000/api/game/${game._id}`);
          if (res.data) {
            setGame(res.data);
            // Check if computer made a move
            if (res.data.turn === 0 && game.turn === 1) {
              const lastComputerMove = res.data.moves[res.data.moves.length - 1];
              if (lastComputerMove && lastComputerMove.player === 'Computer') {
                setLastMove(lastComputerMove);
                setTimeout(() => setLastMove(null), 3000); // Clear after 3 seconds
              }
            }
          }
        } catch (error) {
          console.error('Error polling game:', error);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [game]);

  const startGame = async (mode) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:4000/api/game', { mode, username });
      if (res.data.game) {
        setGame(res.data.game);
        setDice(null);
        setLastMove(null);
        setShowDice(false);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error starting game:', error);
      const errorMessage = error.response?.data?.error || 'Failed to start game. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const rollDice = async () => {
    if (!game || !game._id) {
      alert('No active game found. Please start a new game.');
      return;
    }
    
    setLoading(true);
    setShowDice(true);
    
    try {
      const res = await axios.post(`http://localhost:4000/api/game/${game._id}/roll`);
      if (res.data.game) {
        setGame(res.data.game);
        setDice(res.data.dice);
        setLastMove({
          player: username,
          dice: res.data.dice,
          cherryBonus: res.data.cherryBonus || 0
        });
        setTimeout(() => setLastMove(null), 3000);
        setTimeout(() => setShowDice(false), 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error rolling dice:', error);
      const errorMessage = error.response?.data?.error || 'Failed to roll dice. Please try again.';
      alert(errorMessage);
      setShowDice(false);
    } finally {
      setLoading(false);
    }
  };

  const resetGame = () => {
    setGame(null);
    setDice(null);
    setLoading(false);
    setLastMove(null);
    setShowDice(false);
  };

  const quitGame = () => {
    if (confirm('Are you sure you want to quit? All progress will be lost.')) {
      resetGame();
    }
  };

  const logout = () => {
    if (confirm('Are you sure you want to logout?')) {
      setToken('');
      setUsername('');
      setGame(null);
      setDice(null);
      setLoading(false);
      setLastMove(null);
      setShowDice(false);
    }
  };

  if (!token) {
    return (
      <div className="app-container">
        <Login setToken={setToken} setUsername={setUsername} />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="app-container">
        <GameMenu username={username} startGame={startGame} loading={loading} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="game-header">
        <h2 className="game-title">🍒 Cherry Game 🍒</h2>
      </div>
      
      <div className="game-board-container">
        <Board positions={game.positions} />
      </div>
      
      {/* Animated Dice Display */}
      {showDice && (
        <div className="dice-animation">
          <div className="dice-container">
            <div className="dice">
              <span className="dice-number">{dice || '?'}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Last Move Display */}
      {lastMove && (
        <div className={`move-display ${lastMove.player === username ? 'player-move' : 'computer-move'}`}>
          <h4 className="move-title">
            {lastMove.player === username ? '🎯 Your Move' : '🤖 Computer Move'}
          </h4>
          <p className="move-dice">
            <strong>Dice:</strong> {lastMove.dice}
          </p>
          {lastMove.cherryBonus > 0 && (
            <p className="cherry-bonus">
              🍒 Cherry Bonus: +{lastMove.cherryBonus}!
            </p>
          )}
          {lastMove.aiReason && (
            <p className="ai-reason">
              AI Strategy: {lastMove.aiReason}
            </p>
          )}
        </div>
      )}
      
      {/* Game Statistics */}
      <div className="game-stats">
        <div className="stat-item">
          <div className="stat-value player1">{game.positions[0]}</div>
          <div className="stat-label">Player 1 ({username})</div>
        </div>
        <div className="stat-item">
          <div className="stat-value player2">{game.positions[1]}</div>
          <div className="stat-label">
            {game.mode === 'pvc' ? 'Computer' : 'Player 2'}
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-value moves">{game.moves ? game.moves.length : 0}</div>
          <div className="stat-label">Moves</div>
        </div>
      </div>
      
      <div className="game-controls">
        {game.finished ? (
          <div className="winner-section">
            <h3 className="winner-text">🎉 Winner: {game.winner} 🎉</h3>
            <button className="btn btn-primary btn-large" onClick={resetGame}>
              Play Again
            </button>
          </div>
        ) : (
          <div className="game-status">
            <p className="turn-indicator">
              <strong>Turn:</strong> {game.players[game.turn]}
            </p>
            {game.mode === 'pvc' && game.turn === 1 && (
              <div className="computer-thinking">
                🤖 Computer is thinking...
                <div className="thinking-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            {((game.mode === 'pvc' && game.turn === 0) || game.mode === 'pvp') && (
              <button 
                className={`btn btn-success btn-large ${loading ? 'btn-loading' : ''}`}
                onClick={rollDice}
                disabled={loading}
              >
                {loading ? '⏳ Rolling...' : '🎲 Roll Dice'}
              </button>
            )}
            {dice && (
              <p className="dice-result">
                You rolled: <span className="dice-highlight">{dice}</span>
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Game Rules */}
      <div className="game-rules">
        <h4 className="rules-title">🎮 Game Rules</h4>
        <ul className="rules-list">
          <li>Roll dice to move forward 1-6 spaces</li>
          <li>🍒 Land on spaces 15, 30, 45, 60, 75, 90 for +10 bonus!</li>
          <li>Reach exactly 100 to win (overshooting keeps you in place)</li>
          <li>Computer AI uses strategic thinking!</li>
        </ul>
      </div>
      
      <div className="game-actions">
        <button className="btn btn-danger" onClick={quitGame}>
          Quit Game
        </button>
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;