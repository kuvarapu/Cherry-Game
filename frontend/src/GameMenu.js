import React from 'react';
import MagicButton from './MagicButton';

function GameMenu({ username, startGame, loadingMode, statusMessage, onLogout }) {
  const isBusy = Boolean(loadingMode);
  const twoPlayerBusy = loadingMode === 'multi';
  const singlePlayerBusy = loadingMode === 'single';

  return (
    <div style={{
      padding: 40,
      maxWidth: 520,
      margin: '50px auto',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      borderRadius: '12px',
      boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#e91e63', marginBottom: 24 }}>🍒 Welcome {username} 🍒</h2>
      <p style={{ fontSize: '18px', marginBottom: 24, color: '#666' }}>
        Choose your game mode to start playing!
      </p>

      {statusMessage && statusMessage.type === 'error' && (
        <div className="status-message error" style={{ marginBottom: 24 }}>
          {statusMessage.text}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', alignItems: 'center' }}>
        <MagicButton
          onClick={() => startGame('multi')}
          disabled={isBusy}
          style={{
            width: '220px',
            backgroundColor: twoPlayerBusy ? '#ccc' : undefined
          }}
        >
          {twoPlayerBusy ? '⏳ Starting...' : '👥 Two Player'}
        </MagicButton>
        <MagicButton
          onClick={() => startGame('single')}
          disabled={isBusy}
          style={{
            width: '220px',
            backgroundColor: singlePlayerBusy ? '#ccc' : undefined
          }}
        >
          {singlePlayerBusy ? '⏳ Starting...' : '🤖 Play vs Computer'}
        </MagicButton>
      </div>

      <button
        type="button"
        onClick={onLogout}
        style={{
          marginTop: 30,
          padding: '12px 24px',
          fontSize: '16px',
          borderRadius: '8px',
          border: 'none',
          background: '#607d8b',
          color: '#fff',
          cursor: 'pointer'
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default GameMenu;