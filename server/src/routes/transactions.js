const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Transaction = require('../models/transaction');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const transactionValidation = [
  body('type').isIn(['deposit', 'withdrawal']),
  body('amount').isFloat({ min: 0.01 })
];

const listValidation = [
  query('type').optional().isIn(['deposit', 'withdrawal', 'bet', 'win']),
  query('status').optional().isIn(['pending', 'completed', 'failed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
];

// Create new transaction
router.post('/', [authenticate, transactionValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, amount } = req.body;
    const userId = req.user._id;

    // For withdrawals, check if amount is negative
    const transactionAmount = type === 'withdrawal' ? -Math.abs(amount) : amount;

    const transaction = await Transaction.createAndProcess({
      userId,
      type,
      amount: transactionAmount,
      metadata: req.body.metadata || {}
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction creation error:', error);
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get user's transactions
router.get('/my', [authenticate, listValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, status, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('gameId', 'name'),
      Transaction.countDocuments(query)
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Admin routes

// Get all transactions (admin only)
router.get('/', [authenticate, requireAdmin, listValidation], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, status, userId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('userId', 'username email')
        .populate('gameId', 'name'),
      Transaction.countDocuments(query)
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transaction statistics (admin only)
router.get('/statistics', [authenticate, requireAdmin], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const query = {};
    
    if (startDate) query.createdAt = { $gte: new Date(startDate) };
    if (endDate) query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };

    const stats = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
          average: { $avg: '$amount' }
        }
      }
    ]);

    // Calculate success rates
    const successRates = await Transaction.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          successful: {
            $sum: {
              $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          type: '$_id',
          successRate: {
            $multiply: [
              { $divide: ['$successful', '$total'] },
              100
            ]
          }
        }
      }
    ]);

    res.json({
      transactionStats: stats,
      successRates
    });
  } catch (error) {
    console.error('Statistics fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update transaction status (admin only)
router.patch('/:transactionId', [authenticate, requireAdmin], async (req, res) => {
  try {
    const { status } = req.body;
    if (!['completed', 'failed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const transaction = await Transaction.findById(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (transaction.status !== 'pending') {
      return res.status(400).json({ error: 'Can only update pending transactions' });
    }

    transaction.status = status;
    transaction.processingDetails.completedAt = new Date();
    if (status === 'failed') {
      transaction.processingDetails.error = req.body.error || 'Transaction rejected by admin';
    }

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    console.error('Transaction update error:', error);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

module.exports = router;
