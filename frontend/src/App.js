import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import Board from './Board';
import Login from './Login';
import GameMenu from './GameMenu';
import './App.css';
import CherryRain from './CherryRain';

const CHERRY_INDICES = [14, 29, 44, 59, 74, 89];

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [game, setGame] = useState(null);
  const [dice, setDice] = useState(null);
  const [modeLoading, setModeLoading] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [lastMove, setLastMove] = useState(null);
  const [showDice, setShowDice] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  const buildBoardFromState = useCallback((positions = []) => {
    const board = new Array(100).fill(null);
    CHERRY_INDICES.forEach(index => {
      board[index] = 'cherry';
    });

    const [playerOne, playerTwo] = positions;
    if (Number.isInteger(playerOne) && playerOne > 0 && playerOne <= 100) {
      board[playerOne - 1] = 1;
    }
    if (Number.isInteger(playerTwo) && playerTwo > 0 && playerTwo <= 100) {
      board[playerTwo - 1] = board[playerTwo - 1] === 1 ? 'both' : 2;
    }

    return board;
  }, []);

  const normalizeGame = useCallback((rawGame) => {
    if (!rawGame) return null;

    const id = rawGame.id || rawGame._id;
    const backendMode = rawGame.mode;
    const mode = backendMode === 'pvc' || backendMode === 'single' ? 'single' : 'multi';
    const positions = Array.isArray(rawGame.positions) && rawGame.positions.length === 2
      ? rawGame.positions.slice(0, 2)
      : [1, 1];
    const players = Array.isArray(rawGame.players) && rawGame.players.length === 2
      ? rawGame.players
      : [username || 'Player 1', mode === 'single' ? 'Computer' : 'Player 2'];
    const moves = Array.isArray(rawGame.moves) ? rawGame.moves : [];
    const board = Array.isArray(rawGame.board) && rawGame.board.length === 100
      ? rawGame.board
      : buildBoardFromState(positions);
    const turn = typeof rawGame.turn === 'number' ? rawGame.turn : 0;
    const winner = rawGame.winner || '';
    const lastMoveData = rawGame.lastMove || (moves.length ? moves[moves.length - 1] : null);

    return {
      ...rawGame,
      id,
      mode,
      backendMode,
      positions,
      players,
      board,
      moves,
      turn,
      finished: Boolean(rawGame.finished),
      winner,
      lastRoll: rawGame.lastRoll ?? null,
      lastMove: lastMoveData,
    };
  }, [buildBoardFromState, username]);

  const resetGameState = useCallback(() => {
    setGame(null);
    setDice(null);
    setLastMove(null);
    setShowDice(false);
    setModeLoading(null);
    setIsRolling(false);
    setStatusMessage(null);
  }, []);

  const resetSession = useCallback(() => {
    resetGameState();
    setToken('');
    setUsername('');
  }, [resetGameState]);

  const handleAuthError = useCallback(() => {
    alert('Session expired. Please login again.');
    resetSession();
  }, [resetSession]);

  // Load session from localStorage on first render
  useEffect(() => {
    const storedSession = localStorage.getItem('cherryGameSession');
    if (storedSession) {
      try {
        const parsed = JSON.parse(storedSession);
        if (parsed.token && parsed.username) {
          setToken(parsed.token);
          setUsername(parsed.username);
        }
      } catch (error) {
        console.warn('Failed to parse stored session:', error);
        localStorage.removeItem('cherryGameSession');
      }
    }
  }, []);

  // Persist session whenever token or username changes
  useEffect(() => {
    if (token && username) {
      localStorage.setItem('cherryGameSession', JSON.stringify({ token, username }));
    } else {
      localStorage.removeItem('cherryGameSession');
    }
  }, [token, username]);

  // Ensure API client carries the latest auth token
  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  // Poll for computer moves in single-player mode
  useEffect(() => {
    if (!game || game.mode !== 'single' || game.finished) {
      return undefined;
    }

    const gameId = game.id || game._id;
    if (!gameId) {
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const response = await api.get(`/game/${gameId}`);
        if (response.data?.game) {
          const updatedGame = normalizeGame(response.data.game);
          setGame(updatedGame);

          const moves = Array.isArray(updatedGame.moves) ? updatedGame.moves : [];
          if (updatedGame.turn === 0 && game.turn === 1 && moves.length) {
            const lastComputerMove = moves[moves.length - 1];
            if (lastComputerMove.player === 'Computer') {
              setLastMove(lastComputerMove);
              setTimeout(() => setLastMove(null), 3000);
            }
          }
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleAuthError();
        } else {
          console.error('Error polling game:', error);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [game, handleAuthError, normalizeGame]);

  const startGame = async (mode) => {
    if (!username) {
      alert('Please login again before starting a game.');
      return;
    }

    const selectedMode = mode === 'multi' ? 'multi' : 'single';
    setModeLoading(selectedMode);
    setStatusMessage(null);
    setIsRolling(false);

    try {
      const response = await api.post('/game/start', { mode: selectedMode, username });
      if (response.data?.game) {
        const newGame = normalizeGame(response.data.game);
        setGame(newGame);
        setDice(null);
        setLastMove(null);
        setShowDice(false);
        setStatusMessage({
          type: 'success',
          text: selectedMode === 'single' ? 'Single player game ready!' : 'Two player game ready!',
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        const message = error.response?.data?.error || 'Failed to start game. Please try again.';
        setStatusMessage({ type: 'error', text: message });
      }
    } finally {
      setModeLoading(null);
    }
  };

  const rollDice = async () => {
    if (!game) {
      alert('No active game found. Please start a new game.');
      return;
    }

    const gameId = game.id || game._id;
    if (!gameId) {
      alert('Unable to locate the current game. Please start a new one.');
      return;
    }

    if (game.mode === 'single' && game.turn === 1) {
      setStatusMessage({ type: 'info', text: 'Please wait for the computer to finish its move.' });
      return;
    }

    setIsRolling(true);
    setShowDice(true);
    setStatusMessage(null);

    try {
      const response = await api.post(`/game/${gameId}/roll`);
      if (response.data?.game) {
        const updatedGame = normalizeGame(response.data.game);
        setGame(updatedGame);

        const diceValue = response.data.dice ?? updatedGame.lastRoll ?? null;
        setDice(diceValue);

        const latestMove = updatedGame.lastMove
          || (updatedGame.moves && updatedGame.moves.length ? updatedGame.moves[updatedGame.moves.length - 1] : null);
        if (latestMove) {
          setLastMove(latestMove);
          setTimeout(() => setLastMove(null), 3000);
        }

        setTimeout(() => setShowDice(false), 1500);

        if (!updatedGame.finished && updatedGame.mode === 'single' && updatedGame.turn === 1) {
          setStatusMessage({ type: 'info', text: 'Computer is thinking...' });
        } else if (updatedGame.finished) {
          setStatusMessage({
            type: 'success',
            text: `${updatedGame.winner || 'A player'} wins the game!`,
          });
        } else {
          setStatusMessage(null);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleAuthError();
      } else {
        const message = error.response?.data?.error || 'Failed to roll dice. Please try again.';
        alert(message);
      }
      setShowDice(false);
    } finally {
      setIsRolling(false);
    }
  };

  const resetGame = () => {
    resetGameState();
    setStatusMessage({ type: 'info', text: 'Game reset. Choose a mode to play again.' });
  };

  const quitGame = () => {
    if (confirm('Are you sure you want to quit? All progress will be lost.')) {
      resetGameState();
      setStatusMessage({ type: 'info', text: 'Game exited. Pick a mode to start a new match.' });
    }
  };

  const logout = () => {
    if (confirm('Are you sure you want to logout?')) {
      resetSession();
    }
  };

  const renderStatusMessage = () => {
    if (!statusMessage) return null;
    return (
      <div className={`status-message ${statusMessage.type}`}>
        {statusMessage.text}
      </div>
    );
  };

  if (!token) {
    return (
      <>
        <CherryRain count={30} />
        <div className="app-container">
          <Login setToken={setToken} setUsername={setUsername} />
        </div>
      </>
    );
  }

  if (!game) {
    return (
      <>
        <CherryRain count={25} />
        <div className="app-container">
          {renderStatusMessage()}
          <GameMenu
            username={username}
            startGame={startGame}
            loadingMode={modeLoading}
            statusMessage={statusMessage}
            onLogout={logout}
          />
        </div>
      </>
    );
  }

  const isSinglePlayer = game.mode === 'single';
  const currentPlayerName = game.players && game.players[game.turn]
    ? game.players[game.turn]
    : game.turn === 0
      ? username || 'Player 1'
      : isSinglePlayer
        ? 'Computer'
        : 'Player 2';
  const opponentLabel = isSinglePlayer ? 'Computer' : (game.players && game.players[1]) ? game.players[1] : 'Player 2';
  const winnerLabel = game.winner === username ? 'You' : game.winner || 'Unknown';

  const lastMovePlayerName = lastMove
    ? (typeof lastMove.player === 'number'
        ? (game.players && game.players[lastMove.player - 1]) || `Player ${lastMove.player}`
        : lastMove.player || 'Player')
    : '';
  const isComputerMove = lastMove && lastMove.player === 'Computer';

  return (
    <>
      <CherryRain count={20} />
      <div className="app-container">
        <div className="game-header">
          <h2 className="game-title">🍒 Cherry Game 🍒</h2>
          {renderStatusMessage()}
        </div>

        <div className="game-board-container">
          <Board positions={game.positions} />
        </div>

        {showDice && (
          <div className="dice-animation">
            <div className="dice-container">
              <div className="dice">
                <span className="dice-number">{dice || '?'}</span>
              </div>
            </div>
          </div>
        )}

        {lastMove && (
          <div className={`move-display ${isComputerMove ? 'computer-move' : 'player-move'}`}>
            <h4 className="move-title">
              {isComputerMove ? '🤖 Computer Move' : `🎯 ${lastMovePlayerName} Move`}
            </h4>
            {lastMove.dice && (
              <p className="move-dice">
                <strong>Dice:</strong> {lastMove.dice}
              </p>
            )}
            {lastMove.cherryBonus && lastMove.cherryBonus > 0 && (
              <p className="cherry-bonus">🍒 Cherry Bonus: +{lastMove.cherryBonus}!</p>
            )}
            {lastMove.aiReason && (
              <p className="ai-reason">AI Strategy: {lastMove.aiReason}</p>
            )}
          </div>
        )}

        <div className="game-stats">
          <div className="stat-item">
            <div className="stat-value player1">{game.positions[0]}</div>
            <div className="stat-label">Player 1 ({username})</div>
          </div>
          <div className="stat-item">
            <div className="stat-value player2">{game.positions[1]}</div>
            <div className="stat-label">{opponentLabel}</div>
          </div>
          <div className="stat-item">
            <div className="stat-value moves">{game.moves ? game.moves.length : 0}</div>
            <div className="stat-label">Moves</div>
          </div>
        </div>

        <div className="game-controls">
          {game.finished ? (
            <div className="winner-section">
              <h3 className="winner-text">🎉 Winner: {winnerLabel} 🎉</h3>
              <button className="btn btn-primary btn-large" onClick={resetGame}>
                Play Again
              </button>
            </div>
          ) : (
            <div className="game-status">
              <p className="turn-indicator">
                <strong>Turn:</strong> {currentPlayerName}
              </p>
              {isSinglePlayer && game.turn === 1 && (
                <div className="computer-thinking">
                  🤖 Computer is thinking...
                  <div className="thinking-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <button
                className={`btn btn-success btn-large ${isRolling ? 'btn-loading' : ''}`}
                onClick={rollDice}
                disabled={isRolling || (isSinglePlayer && game.turn !== 0)}
              >
                {isRolling ? '⏳ Rolling...' : '🎲 Roll Dice'}
              </button>
              {dice && (
                <p className="dice-result">
                  Last roll: <span className="dice-highlight">{dice}</span>
                </p>
              )}
            </div>
          )}
        </div>

        <div className="game-rules">
          <h4 className="rules-title">🎮 Game Rules</h4>
          <ul className="rules-list">
            <li>Roll dice to move forward 1-6 spaces</li>
            <li>🍒 Land on spaces 15, 30, 45, 60, 75, 90 for a +10 bonus!</li>
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
    </>
  );
}

export default App;