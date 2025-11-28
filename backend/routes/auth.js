const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const passport = require('../config/passport');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    
    if (password.length < 3) {
      return res.status(400).json({ error: 'Password must be at least 3 characters long' });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Hash password and create user
    const hash = await bcrypt.hash(password, 10);
    await User.create({ username, password: hash });
    
    res.json({ message: 'User registered successfully!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Input validation
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }
    
    // Generate token using config JWT_SECRET
    const token = jwt.sign({ username }, config.JWT_SECRET);
    res.json({ token, message: 'Login successful!' });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Google OAuth routes
router.get('/auth/google',
  (req, res, next) => {
    const config = require('../config');
    const isConfigured = config.GOOGLE_CLIENT_ID && 
                        config.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID';
    
    if (!isConfigured) {
      return res.status(503).json({ 
        error: 'Google OAuth is not configured',
        message: 'Please configure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env file',
        setupGuide: 'See SETUP_GOOGLE_OAUTH.html for instructions'
      });
    }
    next();
  },
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false
  })
);

router.get('/auth/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: 'http://localhost:8080?error=auth_failed'
  }),
  async (req, res) => {
    try {
      // Generate JWT token for the authenticated user
      const token = jwt.sign({ username: req.user.username }, config.JWT_SECRET);
      
      // Redirect to frontend with token
      res.redirect(`http://localhost:8080?token=${token}&username=${req.user.username}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect('http://localhost:8080?error=auth_failed');
    }
  }
);

module.exports = router;