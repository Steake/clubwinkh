const express = require('express');
const LeaderboardEntry = require('../models/leaderboardEntry');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Get leaderboard for a specific period
router.get('/:period', isAuthenticated, async (req, res) => {
  try {
    const { period } = req.params;
    const { limit = 10, page = 1 } = req.query;

    if (!['daily', 'weekly', 'monthly'].includes(period)) {
      return res.status(400).json({ error: 'Invalid period' });
    }

    const entries = await LeaderboardEntry.find({ period })
      .sort({ score: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'username');

    const total = await LeaderboardEntry.countDocuments({ period });

    res.json({
      entries,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user's leaderboard positions
router.get('/user/:userId', isAuthenticated, async (req, res) => {
  try {
    const userId = req.params.userId;
    const periods = ['daily', 'weekly', 'monthly'];
    
    const positions = await Promise.all(
      periods.map(async (period) => {
        const position = await LeaderboardEntry.findOne({
          userId,
          period
        }).sort({ score: -1 });

        if (!position) {
          return { period, rank: null, score: 0 };
        }

        const rank = await LeaderboardEntry.countDocuments({
          period,
          score: { $gt: position.score }
        }) + 1;

        return {
          period,
          rank,
          score: position.score
        };
      })
    );

    res.json({ positions });
  } catch (error) {
    console.error('Position fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// Update user's score for current periods
router.post('/update-score', isAuthenticated, async (req, res) => {
  try {
    const { score, gameId } = req.body;
    const userId = req.user._id;

    if (typeof score !== 'number' || score < 0) {
      return res.status(400).json({ error: 'Invalid score' });
    }

    const periods = ['daily', 'weekly', 'monthly'];
    const updates = await Promise.all(
      periods.map(async (period) => {
        const entry = await LeaderboardEntry.findOneAndUpdate(
          { userId, period, gameId },
          { 
            $max: { score },
            $setOnInsert: { userId, period, gameId }
          },
          { 
            new: true,
            upsert: true
          }
        );

        return entry;
      })
    );

    res.json({ updates });
  } catch (error) {
    console.error('Score update error:', error);
    res.status(500).json({ error: 'Failed to update score' });
  }
});

module.exports = router;
