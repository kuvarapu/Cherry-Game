// MongoDB Configuration for Cherry Game
// Update this file with your MongoDB Atlas connection string

// Load environment variables from .env file
require('dotenv').config();

module.exports = {
  // MongoDB Connection String
  // Replace this with your MongoDB Atlas connection string
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/cherry_game',
  
  // MongoDB Atlas connection string (uncomment and update with your actual string):
  // MONGODB_URI: 'mongodb+srv://cherrygame:CherryGame123!@cluster0.mongodb.net/cherry_game',
  
  // JWT Secret (use environment variable for production)
  JWT_SECRET: process.env.JWT_SECRET || 'SECRET',
  
  // Server Port (use environment variable for production)
  PORT: process.env.PORT || 4000,
  
  // Google OAuth Configuration
  // Get these from https://console.cloud.google.com/
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:4000/api/auth/google/callback',
  
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
