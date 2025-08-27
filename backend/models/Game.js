const mongoose = require('mongoose');

// Simple in-memory game storage for development
let games = [];

const GameSchema = new mongoose.Schema({
  players: [String],
  positions: [Number],
  turn: Number,
  mode: String, // 'pvp' or 'pvc'
  finished: Boolean,
  winner: String,
  createdAt: { type: Date, default: Date.now },
  moves: [{
    player: String,
    dice: Number,
    fromPosition: Number,
    toPosition: Number,
    cherryBonus: { type: Number, default: 0 },
    aiReason: String,
    timestamp: { type: Date, default: Date.now }
  }]
});

// Add static methods for in-memory operations
GameSchema.statics.create = function(gameData) {
  const game = { ...gameData, _id: Date.now().toString(), createdAt: new Date() };
  games.push(game);
  return Promise.resolve(game);
};

GameSchema.statics.findById = function(id) {
  const game = games.find(game => game._id === id);
  if (game) {
    // Add the saveGame method to the returned game object
    game.saveGame = function() {
      const gameIndex = games.findIndex(g => g._id === this._id);
      if (gameIndex !== -1) {
        games[gameIndex] = { ...this };
      } else {
        games.push({ ...this });
      }
      return Promise.resolve(this);
    };
  }
  return Promise.resolve(game);
};

GameSchema.statics.findByIdAndUpdate = function(id, update, options) {
  const gameIndex = games.findIndex(game => game._id === id);
  if (gameIndex !== -1) {
    games[gameIndex] = { ...games[gameIndex], ...update };
    // Add saveGame method to the updated game
    if (games[gameIndex]) {
      games[gameIndex].saveGame = function() {
        const idx = games.findIndex(g => g._id === this._id);
        if (idx !== -1) {
          games[idx] = { ...this };
        } else {
          games.push({ ...this });
        }
        return Promise.resolve(this);
      };
    }
    return Promise.resolve(games[gameIndex]);
  }
  return Promise.resolve(null);
};

GameSchema.statics.find = function(query) {
  if (query && query.players) {
    const filteredGames = games.filter(game => 
      game.players.includes(query.players.$in[0])
    );
    // Add saveGame method to each game
    filteredGames.forEach(game => {
      game.saveGame = function() {
        const gameIndex = games.findIndex(g => g._id === this._id);
        if (gameIndex !== -1) {
          games[gameIndex] = { ...this };
        } else {
          games.push({ ...this });
        }
        return Promise.resolve(this);
      };
    });
    return Promise.resolve(filteredGames);
  }
  // Add saveGame method to all games
  games.forEach(game => {
    game.saveGame = function() {
      const gameIndex = games.findIndex(g => g._id === this._id);
      if (gameIndex !== -1) {
        games[gameIndex] = { ...this };
      } else {
        games.push({ ...this });
      }
      return Promise.resolve(this);
    };
  });
  return Promise.resolve(games);
};

// Add instance method for saving (renamed to avoid Mongoose conflict)
GameSchema.methods.saveGame = function() {
  const gameIndex = games.findIndex(game => game._id === this._id);
  if (gameIndex !== -1) {
    games[gameIndex] = { ...this };
  } else {
    games.push({ ...this });
  }
  return Promise.resolve(this);
};

// Override the save method to use our custom implementation
GameSchema.methods.save = function() {
  return this.saveGame();
};

module.exports = mongoose.model('Game', GameSchema);