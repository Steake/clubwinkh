const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'bet', 'win'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        // Deposits and wins should be positive, withdrawals and bets should be negative
        if (['deposit', 'win'].includes(this.type)) {
          return v > 0;
        } else {
          return v < 0;
        }
      },
      message: props => `${props.value} is not a valid amount for transaction type ${props.type}`
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    // Only required for bet and win transactions
    required: function() {
      return ['bet', 'win'].includes(this.type);
    }
  },
  metadata: {
    // Additional transaction details (e.g., payment method, game details)
    type: mongoose.Schema.Types.Mixed
  },
  processingDetails: {
    startedAt: Date,
    completedAt: Date,
    error: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: 1 });

// Methods

// Process the transaction and update user balance
transactionSchema.methods.process = async function() {
  const User = mongoose.model('User');
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Find user and lock their document for atomic operation
    const user = await User.findById(this.userId).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // Update user balance
    await user.updateBalance(this.amount);
    
    // Mark transaction as completed
    this.status = 'completed';
    this.processingDetails.completedAt = new Date();
    await this.save({ session });

    await session.commitTransaction();
    return true;
  } catch (error) {
    await session.abortTransaction();
    
    // Mark transaction as failed
    this.status = 'failed';
    this.processingDetails.error = error.message;
    await this.save();
    
    throw error;
  } finally {
    session.endSession();
  }
};

// Static methods

// Create and process a new transaction
transactionSchema.statics.createAndProcess = async function(transactionData) {
  const transaction = new this({
    ...transactionData,
    processingDetails: {
      startedAt: new Date()
    }
  });
  
  await transaction.process();
  return transaction;
};

// Get user's transaction history with filtering
transactionSchema.statics.getUserHistory = function(userId, filters = {}) {
  const query = { userId };
  
  if (filters.type) query.type = filters.type;
  if (filters.status) query.status = filters.status;
  if (filters.startDate) query.createdAt = { $gte: filters.startDate };
  if (filters.endDate) query.createdAt = { ...query.createdAt, $lte: filters.endDate };
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit || 50);
};

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
