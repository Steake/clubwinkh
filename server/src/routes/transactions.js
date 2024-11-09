const express = require('express');
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/transaction');
const { isAuthenticated } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const transactionValidation = [
  body('type').isIn(['deposit', 'withdrawal', 'bet', 'win']),
  body('amount').isFloat({ min: 0.01 }),
  body('description').optional().isString()
];

// Get user's transactions
router.get('/', isAuthenticated, async (req, res) => {
  try {
    const transactions = await Transaction.getUserHistory(req.user._id);
    res.json({ transactions });
  } catch (error) {
    console.error('Transaction list error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Create new transaction
router.post('/', isAuthenticated, transactionValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const transaction = await Transaction.createAndProcess({
      userId: req.user._id,
      ...req.body
    });

    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Transaction creation error:', error);
    if (error.message === 'Insufficient balance') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create transaction' });
  }
});

// Get transaction details
router.get('/:transactionId', isAuthenticated, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.transactionId,
      userId: req.user._id
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

module.exports = router;
