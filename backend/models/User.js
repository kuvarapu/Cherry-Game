const mongoose = require('mongoose');

// Simple in-memory user storage for development
let users = [];

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
  email: String,
  googleId: String,
  displayName: String,
  avatar: String,
  createdAt: { type: Date, default: Date.now },
  stats: {
    totalGames: { type: Number, default: 0 },
    gamesWon: { type: Number, default: 0 },
    gamesLost: { type: Number, default: 0 },
    pvcGames: { type: Number, default: 0 },
    pvpGames: { type: Number, default: 0 },
    totalMoves: { type: Number, default: 0 },
    cherriesCollected: { type: Number, default: 0 },
    bestPosition: { type: Number, default: 0 },
    lastPlayed: Date
  },
  gameHistory: [{
    gameId: String,
    mode: String,
    result: String, // 'win', 'loss', 'quit'
    finalPosition: Number,
    moves: Number,
    cherries: Number,
    opponent: String,
    playedAt: { type: Date, default: Date.now }
  }]
});

// Add static methods for in-memory operations
UserSchema.statics.findOne = function(query) {
  if (query.username) {
    return Promise.resolve(users.find(user => user.username === query.username));
  }
  if (query.googleId) {
    return Promise.resolve(users.find(user => user.googleId === query.googleId));
  }
  if (query.email) {
    return Promise.resolve(users.find(user => user.email === query.email));
  }
  return Promise.resolve(null);
};

UserSchema.statics.create = function(userData) {
  const user = { 
    ...userData, 
    _id: Date.now().toString(),
    createdAt: new Date(),
    stats: {
      totalGames: 0,
      gamesWon: 0,
      gamesLost: 0,
      pvcGames: 0,
      pvpGames: 0,
      totalMoves: 0,
      cherriesCollected: 0,
      bestPosition: 0
    },
    gameHistory: []
  };
  users.push(user);
  return Promise.resolve(user);
};

UserSchema.statics.findOneAndUpdate = function(query, update, options) {
  const userIndex = users.findIndex(user => user.username === query.username);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...update };
    return Promise.resolve(users[userIndex]);
  }
  return Promise.resolve(null);
};

// Helper to get all users (for admin purposes)
UserSchema.statics.getAllUsers = function() {
  return users;
};

module.exports = mongoose.model('User', UserSchema);