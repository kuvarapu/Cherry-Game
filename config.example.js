// Cherry Game Configuration Example
// Copy this file to config.js and update the values

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 4000,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  
  // MongoDB Configuration (optional - game works without it)
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cherry_game',
  
  // Game Configuration
  MAX_PLAYERS: 2,
  BOARD_SIZE: 100,
  CHERRY_SPACES: [15, 30, 45, 60, 75, 90],
  CHERRY_BONUS: 10,
  
  // Security
  PASSWORD_MIN_LENGTH: 3,
  USERNAME_MIN_LENGTH: 3,
  
  // Game Rules
  WINNING_POSITION: 100,
  DICE_MIN: 1,
  DICE_MAX: 6
};
