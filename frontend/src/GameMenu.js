import React from 'react';

function GameMenu({ username, startGame, loading }) {
  return (
    <div style={{ 
      padding: 40, 
      maxWidth: 500, 
      margin: '50px auto', 
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#e91e63', marginBottom: 30 }}>🍒 Welcome {username} 🍒</h2>
      <p style={{ fontSize: '18px', marginBottom: 30, color: '#666' }}>
        Choose your game mode to start playing!
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        <button 
          onClick={() => startGame('pvp')}
          disabled={loading}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: loading ? '#ccc' : '#4caf50',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '200px'
          }}
        >
          {loading ? '⏳ Starting...' : '👥 Two Player'}
        </button>
        <button 
          onClick={() => startGame('pvc')}
          disabled={loading}
          style={{
            padding: '15px 30px',
            fontSize: '18px',
            backgroundColor: loading ? '#ccc' : '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '200px'
          }}
        >
          {loading ? '⏳ Starting...' : '🤖 Play vs Computer'}
        </button>
      </div>
    </div>
  );
}

export default GameMenu;