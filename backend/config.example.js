// Configuration Example for Cherry Game Backend
// Copy this file to config.js and update the values

module.exports = {
  // MongoDB Connection String
  // For local MongoDB:
  MONGODB_URI: 'mongodb://localhost:27017/cherry_game',
  
  // For MongoDB Atlas (cloud):
  // MONGODB_URI: 'mongodb+srv://username:password@cluster.mongodb.net/cherry_game',
  
  // JWT Secret (change this in production)
  JWT_SECRET: 'SECRET',
  
  // Server Port
  PORT: 4000
};
