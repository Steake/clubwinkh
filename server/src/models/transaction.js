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
    enum: ['deposit', 'withdrawal', 'bet', 'win', 'credit', 'debit'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: function() {
      return ['credit', 'debit'].includes(this.type);
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  metadata: {
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

// Indexes
transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ status: 1, createdAt: 1 });

// Process the transaction and update user balance
transactionSchema.methods.process = async function() {
  const User = mongoose.model('User');
  
  try {
    // Find user
    const user = await User.findById(this.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // For admin operations, check user status
    if (['credit', 'debit'].includes(this.type) && user.status === 'suspended') {
      this.status = 'failed';
      this.processingDetails = {
        ...this.processingDetails,
        error: 'Cannot process transaction for suspended user'
      };
      await this.save();
      throw new Error('Cannot process transaction for suspended user');
    }

    // Calculate new balance
    const balanceChange = ['credit', 'deposit', 'win'].includes(this.type) ? 
      Math.abs(this.amount) : -Math.abs(this.amount);
    const newBalance = user.balance + balanceChange;

    // Check if balance would go negative
    if (newBalance < 0) {
      this.status = 'failed';
      this.processingDetails = {
        ...this.processingDetails,
        error: 'Insufficient balance'
      };
      await this.save();
      throw new Error('Insufficient balance');
    }

    // Update user balance
    user.balance = newBalance;
    await user.save();

    // Mark transaction as completed
    this.status = 'completed';
    this.processingDetails = {
      ...this.processingDetails,
      completedAt: new Date()
    };
    await this.save();

    return true;
  } catch (error) {
    // If not already marked as failed
    if (this.status !== 'failed') {
      this.status = 'failed';
      this.processingDetails = {
        ...this.processingDetails,
        error: error.message
      };
      await this.save();
    }
    throw error;
  }
};

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

// Create an admin transaction (credit/debit)
transactionSchema.statics.createAdminTransaction = async function(adminData) {
  if (!['credit', 'debit'].includes(adminData.type)) {
    throw new Error('Invalid admin transaction type');
  }

  if (!adminData.description) {
    throw new Error('Description is required for admin transactions');
  }

  const transaction = new this({
    ...adminData,
    amount: adminData.type === 'credit' ? Math.abs(adminData.amount) : -Math.abs(adminData.amount),
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
