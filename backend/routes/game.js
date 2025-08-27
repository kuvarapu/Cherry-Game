const express = require('express');
const Game = require('../models/Game');

const router = express.Router();

// AI Strategy for computer player
const calculateAIMove = (currentPosition, opponentPosition, gameMode) => {
  // Strategic AI that considers multiple factors
  const distanceToWin = 100 - currentPosition;
  const distanceToCherry = 15 - (currentPosition % 15);
  const opponentDistanceToWin = 100 - opponentPosition;
  
  // If we can win in this turn, do it
  if (distanceToWin <= 6) {
    return { shouldRoll: true, reason: 'Can win this turn' };
  }
  
  // If opponent is close to winning, prioritize getting ahead
  if (opponentDistanceToWin <= 12 && currentPosition < opponentPosition) {
    return { shouldRoll: true, reason: 'Opponent close to winning, need to catch up' };
  }
  
  // If we're close to a cherry space, try to get it
  if (distanceToCherry <= 6 && distanceToCherry > 0) {
    return { shouldRoll: true, reason: 'Close to cherry bonus' };
  }
  
  // If we're significantly behind, be more aggressive
  if (currentPosition < opponentPosition - 20) {
    return { shouldRoll: true, reason: 'Significantly behind, need to catch up' };
  }
  
  // If we're ahead by a lot, be more conservative
  if (currentPosition > opponentPosition + 20) {
    return { shouldRoll: Math.random() > 0.3, reason: 'Ahead by a lot, being conservative' };
  }
  
  // Default behavior: roll most of the time
  return { shouldRoll: Math.random() > 0.2, reason: 'Standard play' };
};

// Create a new game
router.post('/game', async (req, res) => {
  try {
    const { mode, username } = req.body;
    
    if (!mode || !username) {
      return res.status(400).json({ error: 'Mode and username are required' });
    }
    
    if (!['pvp', 'pvc'].includes(mode)) {
      return res.status(400).json({ error: 'Mode must be either "pvp" or "pvc"' });
    }
    
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long' });
    }
    
    const players = mode === 'pvp' ? [username, 'Player2'] : [username, 'Computer'];
    const game = await Game.create({
      players,
      positions: [1, 1],
      turn: 0,
      mode,
      finished: false,
      winner: '',
      moves: [],
    });
    res.json({ game, message: 'Game created successfully!' });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Get all games (for debugging/admin purposes)
router.get('/games', async (req, res) => {
  try {
    const games = await Game.find();
    res.json({ games, count: games.length });
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({ error: 'Failed to get games' });
  }
});

// Get game state
router.get('/game/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({ error: 'Failed to get game' });
  }
});

// Get game history/moves
router.get('/game/:id/history', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ moves: game.moves || [], gameId: req.params.id });
  } catch (error) {
    console.error('Error getting game history:', error);
    res.status(500).json({ error: 'Failed to get game history' });
  }
});

// Reset a game (for debugging/testing purposes)
router.post('/game/:id/reset', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Reset game state
    game.positions = [1, 1];
    game.turn = 0;
    game.finished = false;
    game.winner = '';
    game.moves = [];
    
    try {
      await game.save();
      res.json({ game, message: 'Game reset successfully!' });
    } catch (saveError) {
      console.error('Error saving reset game:', saveError);
      res.status(500).json({ error: 'Failed to reset game' });
    }
  } catch (error) {
    console.error('Error resetting game:', error);
    res.status(500).json({ error: 'Failed to reset game' });
  }
});

// Get current game moves (alias for history)
router.get('/game/:id/moves', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ moves: game.moves || [], gameId: req.params.id });
  } catch (error) {
    console.error('Error getting game moves:', error);
    res.status(500).json({ error: 'Failed to get game moves' });
  }
});

// Get user's game history
router.get('/user/:username/games', async (req, res) => {
  try {
    const { username } = req.params;
    const games = await Game.find({ 
      players: username,
      finished: true 
    }).sort({ createdAt: -1 }).limit(10);
    
    res.json({ games });
  } catch (error) {
    console.error('Error getting user games:', error);
    res.status(500).json({ error: 'Failed to get user games' });
  }
});

// Roll dice and play turn
router.post('/game/:id/roll', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    if (game.finished) {
      return res.json({ dice: null, game, message: 'Game is already finished' });
    }

    // Validate game state
    if (!game.positions || !Array.isArray(game.positions) || game.positions.length !== 2) {
      return res.status(500).json({ error: 'Invalid game state: positions array is missing or corrupted' });
    }

    if (typeof game.turn !== 'number' || game.turn < 0 || game.turn > 1) {
      return res.status(500).json({ error: 'Invalid game state: turn is invalid' });
    }

    const dice = Math.floor(Math.random() * 6) + 1;
    const fromPosition = game.positions[game.turn];
    
    // Validate current position
    if (typeof fromPosition !== 'number' || fromPosition < 1 || fromPosition > 100) {
      return res.status(500).json({ error: 'Invalid game state: player position is invalid' });
    }
    
    let newPosition = fromPosition + dice;
    let cherryBonus = 0;

    // Check for cherry bonus (every 15th space)
    if (newPosition % 15 === 0 && newPosition <= 90) {
      cherryBonus = 10;
      newPosition += cherryBonus;
    }

    // Ensure we don't exceed 100
    if (newPosition > 100) {
      newPosition = fromPosition; // Stay in place if overshooting
    }

    // Update position
    game.positions[game.turn] = newPosition;
    
    // Ensure moves array exists
    if (!game.moves) {
      game.moves = [];
    }
    
    // Record the move
    game.moves.push({
      player: game.players[game.turn],
      dice: dice,
      fromPosition: fromPosition,
      toPosition: newPosition,
      cherryBonus: cherryBonus,
      timestamp: new Date()
    });

    // Check for win (exact position 100 required)
    if (newPosition === 100) {
      game.finished = true;
      game.winner = game.players[game.turn];
    } else {
      // Switch turns only if we didn't win
      game.turn = 1 - game.turn;
    }

    try {
      // Use the saveGame method to avoid conflicts
      await game.saveGame();
    } catch (saveError) {
      console.error('Error saving game:', saveError);
      return res.status(500).json({ error: 'Failed to save game state' });
    }

    // If vs computer and it's computer's turn, make AI move
    if (!game.finished && game.mode === 'pvc' && game.turn === 1) {
      // Add a delay to make the computer move feel more natural
      setTimeout(async () => {
        try {
          await makeComputerMove(game);
        } catch (error) {
          console.error('Error in computer move:', error);
        }
      }, 1500);
    }

    res.json({ 
      dice, 
      game, 
      cherryBonus,
      message: 'Dice rolled successfully' 
    });
  } catch (error) {
    console.error('Error rolling dice:', error);
    res.status(500).json({ error: 'Failed to roll dice. Please try again.' });
  }
});

// Computer AI move function
async function makeComputerMove(game) {
  try {
    const currentPosition = game.positions[1];
    const opponentPosition = game.positions[0];
    
    // Get AI decision
    const aiDecision = calculateAIMove(currentPosition, opponentPosition, game.mode);
    
    if (!aiDecision.shouldRoll) {
      // AI decides not to roll (strategic decision)
      game.turn = 0; // Switch back to player
      await game.saveGame();
      return;
    }
    
    // AI rolls the dice
    const diceComp = Math.floor(Math.random() * 6) + 1;
    const fromPositionComp = currentPosition;
    let newPositionComp = fromPositionComp + diceComp;
    let cherryBonusComp = 0;

    // Check for cherry bonus
    if (newPositionComp % 15 === 0 && newPositionComp <= 90) {
      cherryBonusComp = 10;
      newPositionComp += cherryBonusComp;
    }

    // Ensure we don't exceed 100
    if (newPositionComp > 100) {
      newPositionComp = fromPositionComp; // Stay in place if overshooting
    }

    // Update position
    game.positions[1] = newPositionComp;
    
    // Record the computer move
    game.moves.push({
      player: game.players[1],
      dice: diceComp,
      fromPosition: fromPositionComp,
      toPosition: newPositionComp,
      cherryBonus: cherryBonusComp,
      timestamp: new Date(),
      aiReason: aiDecision.reason
    });
    
    // Check for win
    if (newPositionComp === 100) {
      game.finished = true;
      game.winner = game.players[1];
    } else {
      // Switch back to player
      game.turn = 0;
    }
    
    await game.saveGame();
  } catch (error) {
    console.error('Error in computer move:', error);
    // If computer move fails, switch back to player
    game.turn = 0;
    try {
      await game.saveGame();
    } catch (saveError) {
      console.error('Error saving game after computer move failure:', saveError);
    }
  }
}

module.exports = router;