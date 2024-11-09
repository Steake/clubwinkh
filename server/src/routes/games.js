const express = require('express');
const { body, validationResult } = require('express-validator');
const Game = require('../models/game');
const { isAdmin, isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get all active games
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const { type, search, page = 1, limit = 10 } = req.query;
    const query = { status: 'active' };

    if (type) query.type = type;
    if (search) {
      query.$text = { $search: search };
    }

    const games = await Game.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Game.countDocuments(query);

    res.json({
      games,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Games list error:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Get game details
router.get('/:gameId', isAuthenticated, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ game });
  } catch (error) {
    console.error('Game fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Admin routes

// Create new game
router.post('/', isAdmin, [
  body('name').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('type').trim().notEmpty(),
  body('minBet').isFloat({ min: 0 }),
  body('maxBet').isFloat({ min: 0 }),
  body('payoutRatio').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const game = new Game(req.body);
    await game.save();

    res.status(201).json({ game });
  } catch (error) {
    console.error('Game creation error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Game name already exists' });
    }
    res.status(500).json({ error: 'Failed to create game' });
  }
});

// Update game
router.patch('/:gameId', isAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'name', 'description', 'status', 'minBet',
      'maxBet', 'payoutRatio', 'settings', 'metadata'
    ];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        game[field] = req.body[field];
      }
    });

    await game.save();
    res.json({ game });
  } catch (error) {
    console.error('Game update error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Game name already exists' });
    }
    res.status(500).json({ error: 'Failed to update game' });
  }
});

// Delete game (soft delete by setting status to disabled)
router.delete('/:gameId', isAdmin, async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    game.status = 'disabled';
    await game.save();

    res.json({ message: 'Game disabled successfully' });
  } catch (error) {
    console.error('Game deletion error:', error);
    res.status(500).json({ error: 'Failed to disable game' });
  }
});

module.exports = router;
