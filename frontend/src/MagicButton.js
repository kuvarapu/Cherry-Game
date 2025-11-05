import React from 'react';
import './MagicButton.css';

const MagicButton = ({ onClick, children, className = '', ...props }) => {
  return (
    <button 
      className={`magic-button ${className}`}
      onClick={onClick}
      {...props}
    >
      <span className="magic-button__text">{children}</span>
      {/* Placeholder for 3D elements - you can add actual images later */}
      <div className="magic-button__cone" style={{
        width: '18px',
        height: '18px',
        background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
        borderRadius: '50%',
        position: 'absolute'
      }}></div>
      <div className="magic-button__torus" style={{
        width: '38px',
        height: '38px',
        background: 'linear-gradient(45deg, #a8e6cf, #dcedc1)',
        borderRadius: '50%',
        position: 'absolute'
      }}></div>
      <div className="magic-button__icosahedron" style={{
        width: '36px',
        height: '36px',
        background: 'linear-gradient(45deg, #ffd93d, #6bcf7f)',
        borderRadius: '50%',
        position: 'absolute'
      }}></div>
      <div className="magic-button__sphere" style={{
        width: '30px',
        height: '30px',
        background: 'linear-gradient(45deg, #74b9ff, #0984e3)',
        borderRadius: '50%',
        position: 'absolute'
      }}></div>
    </button>
  );
};

export default MagicButton;