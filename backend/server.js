const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config');
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection with fallback options
// Temporarily disabled for development - using in-memory storage
/*
const MONGODB_URI = process.env.MONGODB_URI || config.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('✅ Connected to MongoDB successfully!');
}).catch((err) => {
  console.log('❌ MongoDB connection failed. Please make sure MongoDB is running.');
  console.log('📋 Connection details:', MONGODB_URI);
  console.log('');
  console.log('🔧 Solutions:');
  console.log('1. Install MongoDB locally: https://www.mongodb.com/try/download/community');
  console.log('2. Use MongoDB Atlas (cloud): https://www.mongodb.com/atlas');
  console.log('3. Set MONGODB_URI environment variable with your connection string');
  console.log('');
  console.log('💡 For MongoDB Atlas, your connection string should look like:');
  console.log('mongodb+srv://username:password@cluster.mongodb.net/cherry_game');
  console.log('');
  process.exit(1);
});
*/

console.log('🚀 Starting server with in-memory storage...');
console.log('💡 Users will be stored in memory (will reset when server restarts)');

app.use('/api', authRoutes);
app.use('/api', gameRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Cherry Game Backend is running',
    timestamp: new Date().toISOString(),
    storage: 'in-memory'
  });
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || config.PORT;
app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));