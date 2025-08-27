const mongoose = require('mongoose');

// Simple in-memory user storage for development
let users = [];

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

// Add static methods for in-memory operations
UserSchema.statics.findOne = function(query) {
  return Promise.resolve(users.find(user => user.username === query.username));
};

UserSchema.statics.create = function(userData) {
  const user = { ...userData, _id: Date.now().toString() };
  users.push(user);
  return Promise.resolve(user);
};

module.exports = mongoose.model('User', UserSchema);