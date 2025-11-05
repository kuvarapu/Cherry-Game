import React from 'react';
import MagicButton from './MagicButton';

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
        <MagicButton
          onClick={() => startGame('pvp')}
          disabled={loading}
          style={{
            width: '200px',
            backgroundColor: loading ? '#ccc' : undefined
          }}
        >
          {loading ? '⏳ Starting...' : '👥 Two Player'}
        </MagicButton>
        <MagicButton
          onClick={() => startGame('pvc')}
          disabled={loading}
          style={{
            width: '200px',
            backgroundColor: loading ? '#ccc' : undefined
          }}
        >
          {loading ? '⏳ Starting...' : '🤖 Play vs Computer'}
        </MagicButton>
      </div>
    </div>
  );
}

export default GameMenu;