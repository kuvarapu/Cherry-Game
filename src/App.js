import React, { useState } from 'react';
import axios from 'axios';

function Board({ positions }) {
  const squares = [];
  for (let i = 1; i <= 100; i++) {
    let cherry = i % 15 === 0;
    let player1 = positions[0] === i;
    let player2 = positions[1] === i;
    squares.push(
      <div
        key={i}
        style={{
          display: 'inline-block',
          width: 40,
          height: 40,
          margin: 2,
          background: cherry ? 'pink' : '#f0f0f0',
          border: '1px solid #ccc',
          position: 'relative'
        }}
      >
        {cherry && <span style={{ color: 'red', fontWeight: 'bold', fontSize: 20 }}>🍒</span>}
        {player1 && <div style={{ color: 'blue', fontWeight: 'bold' }}>P1</div>}
        {player2 && <div style={{ color: 'green', fontWeight: 'bold' }}>P2</div>}
        <div style={{ position: 'absolute', bottom: 0, right: 2, fontSize: 10 }}>{i}</div>
      </div>
    );
  }
  return <div style={{ width: 440 }}>{squares}</div>;
}

function App() {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [game, setGame] = useState(null);
  const [dice, setDice] = useState(null);

  const login = async () => {
    const res = await axios.post('http://localhost:4000/api/login', { username, password });
    setToken(res.data.token);
  };

  const register = async () => {
    await axios.post('http://localhost:4000/api/register', { username, password });
    alert('Registered! Now login.');
  };

  const startGame = async (mode) => {
    const res = await axios.post('http://localhost:4000/api/game', { mode, username });
    setGame(res.data);
    setDice(null);
  };

  const rollDice = async () => {
    const res = await axios.post(`http://localhost:4000/api/game/${game._id}/roll`);
    setGame(res.data.game);
    setDice(res.data.dice);
  };

  if (!token) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Cherry Game</h2>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} /><br />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br />
        <button onClick={login}>Login</button>
        <button onClick={register}>Register</button>
      </div>
    );
  }

  if (!game) {
    return (
      <div style={{ padding: 20 }}>
        <h2>Welcome {username}</h2>
        <button onClick={() => startGame('pvp')}>Two Player</button>
        <button onClick={() => startGame('pvc')}>Play vs Computer</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Cherry Game</h2>
      <Board positions={game.positions} />
      <div>
        {game.finished ? (
          <h3>Winner: {game.winner}</h3>
        ) : (
          <div>
            <p>Turn: {game.players[game.turn]}</p>
            {game.mode === 'pvc' && game.turn === 1 && <p>Computer is thinking...</p>}
            {game.mode === 'pvc' && game.turn === 0 && <button onClick={rollDice}>Roll Dice</button>}
            {game.mode === 'pvp' && <button onClick={rollDice}>Roll Dice</button>}
            {dice && <p>You rolled: {dice}</p>}
          </div>
        )}
      </div>
      <button onClick={() => window.location.reload()}>Quit Game</button>
    </div>
  );
}

export default App;