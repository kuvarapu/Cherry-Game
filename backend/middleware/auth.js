const jwt = require('jsonwebtoken');
const config = require('../config');

// Authentication middleware to extract user from JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    // For development, allow requests without token but set default user
    req.user = { username: 'Player1' };
    return next();
  }

  jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      // Still allow the request but with default user
      req.user = { username: 'Player1' };
    } else {
      req.user = decoded;
    }
    next();
  });
};

// Optional authentication - allows requests to proceed even without valid token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  
  // Always proceed to the next middleware
  next();
};

module.exports = {
  authenticateToken,
  optionalAuth
};