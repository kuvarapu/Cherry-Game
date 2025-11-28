// Cherry Game Configuration
// Set your backend API URL here for production deployment

window.CHERRY_GAME_CONFIG = {
  // Production API URL - update this when deploying
  API_URL: 'http://localhost:4000/api',
  
  // You can also use environment detection
  // API_URL: window.location.hostname === 'localhost' 
  //   ? 'http://localhost:4000/api'
  //   : 'https://your-backend-url.com/api'
};

// Set the API URL
window.CHERRY_GAME_API_URL = window.CHERRY_GAME_CONFIG.API_URL;
