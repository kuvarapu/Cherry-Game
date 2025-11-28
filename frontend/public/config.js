// Cherry Game Configuration
// Set your backend API URL here for production deployment

window.CHERRY_GAME_CONFIG = {
  // Auto-detect environment
  API_URL: window.location.hostname === 'localhost' 
    ? 'http://localhost:4000/api'
    : 'https://cherry-game-1.onrender.com/api'
};

// Set the API URL
window.CHERRY_GAME_API_URL = window.CHERRY_GAME_CONFIG.API_URL;
