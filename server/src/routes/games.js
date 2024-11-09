const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Game = require('../models/game');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const gameValidation = [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('minBet').isFloat({ min: 0 }),
  body('maxBet').isFloat({ min: 0 }),
  body('houseEdge').optional().isFloat({ min: 0, max: 100 })
];

const betValidation = [
  param('gameId').isMongoId(),
  body('amount').isFloat({ min: 0 })
];

// Get all active games
router.get('/', async (req, res) => {
  try {
    const games = await Game.getActiveGames();
    res.json(games);
  } catch (error) {
    console.error('Games fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get specific game
router.get('/:gameId', async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error) {
    console.error('Game fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Create new game (admin only)
router.post('/', [authenticate, requireAdmin, gameValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, minBet, maxBet, houseEdge } = req.body;

    // Check if game with same name exists
    const existingGame = await Game.findOne({ name });
    if (existingGame) {
      return res.status(409).json({ error: 'Game with this name already exists' });
    }

    const game = new Game({
      name,
      description,
      minBet,
      maxBet,
      houseEdge: houseEdge || 2.5 // Default house edge
    });

    await game.save();
    res.status(201).json(game);
  } catch (error) {
    console.error('Game creation error:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Update game (admin only)
router.put('/:gameId', [authenticate, requireAdmin, gameValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const { name, description, minBet, maxBet, houseEdge, isActive } = req.body;

    // Check name uniqueness if changed
    if (name !== game.name) {
      const existingGame = await Game.findOne({ name });
      if (existingGame) {
        return res.status(409).json({ error: 'Game with this name already exists' });
      }
    }

    Object.assign(game, {
      name,
      description,
      minBet,
      maxBet,
      ...(houseEdge && { houseEdge }),
      ...(typeof isActive === 'boolean' && { isActive })
    });

    await game.save();
    res.json(game);
  } catch (error) {
    console.error('Game update error:', error);
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Place bet on game
router.post('/:gameId/bet', [authenticate, betValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { gameId } = req.params;
    const { amount } = req.body;
    const userId = req.user._id;

    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (!game.isActive) {
      return res.status(400).json({ error: 'Game is not currently active' });
    }

    if (amount < game.minBet || amount > game.maxBet) {
      return res.status(400).json({
        error: `Bet amount must be between ${game.minBet} and ${game.maxBet}`
      });
    }

    // Process bet and get outcome
    const outcome = await game.processBet(userId, amount);

    // Update leaderboard
    const LeaderboardEntry = require('../models/leaderboardEntry');
    const periods = ['daily', 'weekly', 'monthly'];
    
    await Promise.all(periods.map(async period => {
      const entry = await LeaderboardEntry.getOrCreateEntry(userId, period);
      await entry.updateWithGameResult({
        wagered: amount,
        won: outcome.won ? outcome.payout : 0
      });
    }));

    res.json({
      gameId,
      bet: amount,
      outcome
    });
  } catch (error) {
    console.error('Bet processing error:', error);
    res.status(500).json({ error: 'Failed to process bet' });
  }
});

// Get game statistics
router.get('/:gameId/statistics', authenticate, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({
      gameId: game._id,
      name: game.name,
      statistics: game.statistics,
      lastPlayed: game.lastPlayed
    });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get overall games statistics (admin only)
router.get('/statistics/overall', [authenticate, requireAdmin], async (req, res) => {
  try {
    const stats = await Game.getStatistics();
    res.json(stats[0] || {});
  } catch (error) {
    console.error('Overall statistics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch overall statistics' });
  }
});

module.exports = router;
