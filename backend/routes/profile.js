const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Game = require('../models/Game');
const { authenticateToken } = require('../middleware/auth');

// Get user profile with stats and history
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's games
    const userGames = await Game.find({ players: { $in: [username] } });
    
    // Build profile response (exclude password)
    const profile = {
      username: user.username,
      createdAt: user.createdAt,
      stats: user.stats || {
        totalGames: 0,
        gamesWon: 0,
        gamesLost: 0,
        pvcGames: 0,
        pvpGames: 0,
        totalMoves: 0,
        cherriesCollected: 0,
        bestPosition: 0
      },
      gameHistory: (user.gameHistory || []).slice(-20).reverse(), // Last 20 games, most recent first
      recentGames: userGames.slice(-5).reverse().map(game => ({
        id: game._id,
        mode: game.mode,
        finished: game.finished,
        winner: game.winner,
        createdAt: game.createdAt,
        moves: game.moves?.length || 0
      }))
    };
    
    res.json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user stats after game completion
router.post('/profile/update-stats', authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const { gameId, mode, result, finalPosition, moves, cherries, opponent } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Initialize stats if not present
    if (!user.stats) {
      user.stats = {
        totalGames: 0,
        gamesWon: 0,
        gamesLost: 0,
        pvcGames: 0,
        pvpGames: 0,
        totalMoves: 0,
        cherriesCollected: 0,
        bestPosition: 0
      };
    }
    
    // Initialize gameHistory if not present
    if (!user.gameHistory) {
      user.gameHistory = [];
    }
    
    // Update stats
    user.stats.totalGames += 1;
    if (result === 'win') {
      user.stats.gamesWon += 1;
    } else if (result === 'loss') {
      user.stats.gamesLost += 1;
    }
    
    if (mode === 'pvc') {
      user.stats.pvcGames += 1;
    } else if (mode === 'pvp') {
      user.stats.pvpGames += 1;
    }
    
    user.stats.totalMoves += moves || 0;
    user.stats.cherriesCollected += cherries || 0;
    
    if (finalPosition > user.stats.bestPosition) {
      user.stats.bestPosition = finalPosition;
    }
    
    user.stats.lastPlayed = new Date();
    
    // Add to game history
    user.gameHistory.push({
      gameId,
      mode,
      result,
      finalPosition,
      moves: moves || 0,
      cherries: cherries || 0,
      opponent: opponent || (mode === 'pvc' ? 'Computer' : 'Player 2'),
      playedAt: new Date()
    });
    
    // Keep only last 50 games in history
    if (user.gameHistory.length > 50) {
      user.gameHistory = user.gameHistory.slice(-50);
    }
    
    // Update user in database
    await User.findOneAndUpdate({ username }, {
      stats: user.stats,
      gameHistory: user.gameHistory
    });
    
    res.json({ message: 'Stats updated successfully', stats: user.stats });
  } catch (error) {
    console.error('Stats update error:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// Get leaderboard (top players by wins)
router.get('/profile/leaderboard', authenticateToken, async (req, res) => {
  try {
    const users = User.getAllUsers();
    
    const leaderboard = users
      .filter(user => user.stats && user.stats.totalGames > 0)
      .map(user => ({
        username: user.username,
        gamesWon: user.stats.gamesWon || 0,
        totalGames: user.stats.totalGames || 0,
        winRate: user.stats.totalGames > 0 
          ? ((user.stats.gamesWon / user.stats.totalGames) * 100).toFixed(1)
          : 0,
        bestPosition: user.stats.bestPosition || 0
      }))
      .sort((a, b) => b.gamesWon - a.gamesWon)
      .slice(0, 10);
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
