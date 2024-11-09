const express = require('express');
const { query, validationResult } = require('express-validator');
const LeaderboardEntry = require('../models/leaderboardEntry');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const leaderboardValidation = [
  query('period')
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid period specified'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Get leaderboard for specified period
router.get('/', leaderboardValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { period, limit = 100 } = req.query;

    const leaderboard = await LeaderboardEntry.getLeaderboard(period, parseInt(limit));

    // Format response
    const formattedLeaderboard = leaderboard.map(entry => ({
      rank: entry.rank,
      username: entry.userId.username,
      score: entry.score,
      achievements: entry.achievements,
      gamesPlayed: entry.gamesPlayed,
      totalWagered: entry.totalWagered,
      totalWon: entry.totalWon,
      lastActive: entry.lastActive
    }));

    res.json({
      period,
      entries: formattedLeaderboard
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Get user's leaderboard positions
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    const periods = ['daily', 'weekly', 'monthly'];
    
    const positions = await Promise.all(periods.map(async period => {
      const entry = await LeaderboardEntry.findOne({
        userId,
        period,
        ...LeaderboardEntry.calculatePeriodDates(period)
      }).select('rank score period');

      return {
        period,
        rank: entry?.rank || null,
        score: entry?.score || 0
      };
    }));

    res.json({
      userId,
      positions
    });
  } catch (error) {
    console.error('User positions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch user positions' });
  }
});

// Get user's achievements
router.get('/achievements/:userId', authenticate, async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const entries = await LeaderboardEntry.find({
      userId,
      achievements: { $exists: true, $ne: [] }
    })
    .select('period achievements periodStart')
    .sort({ periodStart: -1 });

    const achievements = entries.map(entry => ({
      period: entry.period,
      periodStart: entry.periodStart,
      achievements: entry.achievements
    }));

    res.json({
      userId,
      achievements
    });
  } catch (error) {
    console.error('Achievements fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// Get leaderboard statistics
router.get('/statistics', async (req, res) => {
  try {
    const periods = ['daily', 'weekly', 'monthly'];
    
    const stats = await Promise.all(periods.map(async period => {
      const entries = await LeaderboardEntry.find({
        period,
        ...LeaderboardEntry.calculatePeriodDates(period)
      });

      return {
        period,
        totalPlayers: entries.length,
        totalWagered: entries.reduce((sum, entry) => sum + entry.totalWagered, 0),
        totalWon: entries.reduce((sum, entry) => sum + entry.totalWon, 0),
        averageScore: entries.reduce((sum, entry) => sum + entry.score, 0) / entries.length || 0
      };
    }));

    res.json({
      statistics: stats
    });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
