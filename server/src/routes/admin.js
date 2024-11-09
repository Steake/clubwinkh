const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { isAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all users with optional filtering
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('User list error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user status
router.patch('/users/:userId/status', isAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.status = status;
    await user.save();

    res.json({ user: user.toJSON() });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Process balance operation
router.post('/users/:userId/balance', isAdmin, [
  body('type').isIn(['credit', 'debit']),
  body('amount').isFloat({ min: 0.01 }),
  body('description').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { type, amount, description } = req.body;

    const transaction = await Transaction.createAdminTransaction({
      userId: user._id,
      type,
      amount,
      description
    });

    // Refresh user data after transaction
    const updatedUser = await User.findById(user._id);
    res.json({ 
      user: updatedUser.toJSON(),
      transaction: transaction.toJSON()
    });
  } catch (error) {
    console.error('Balance update error:', error);
    if (error.message === 'Cannot process transaction for suspended user' ||
        error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to process balance operation' });
  }
});

// Get user transactions
router.get('/users/:userId/transactions', isAdmin, async (req, res) => {
  try {
    const { type, startDate, endDate, page = 1, limit = 10 } = req.query;
    const query = { userId: req.params.userId };

    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Transaction list error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

module.exports = router;
