const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  minBet: {
    type: Number,
    required: true,
    min: [0, 'Minimum bet cannot be negative']
  },
  maxBet: {
    type: Number,
    required: true,
    validate: {
      validator: function(v) {
        return v >= this.minBet;
      },
      message: 'Maximum bet must be greater than or equal to minimum bet'
    }
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  houseEdge: {
    type: Number,
    required: true,
    min: [0, 'House edge cannot be negative'],
    max: [100, 'House edge cannot exceed 100%'],
    default: 2.5
  },
  statistics: {
    totalBets: {
      type: Number,
      default: 0
    },
    totalWagered: {
      type: Number,
      default: 0
    },
    totalPayout: {
      type: Number,
      default: 0
    }
  },
  lastPlayed: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
gameSchema.index({ name: 1 });
gameSchema.index({ isActive: 1, createdAt: -1 });

// Methods

// Process a bet and determine the outcome
gameSchema.methods.processBet = async function(userId, amount) {
  const Transaction = mongoose.model('Transaction');
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Validate bet amount
    if (amount < this.minBet || amount > this.maxBet) {
      throw new Error('Invalid bet amount');
    }

    // Create bet transaction
    const betTransaction = await Transaction.createAndProcess({
      userId,
      type: 'bet',
      amount: -amount,
      gameId: this._id,
      metadata: {
        gameName: this.name
      }
    });

    // Calculate game outcome (implement specific game logic here)
    const outcome = await this.calculateOutcome(amount);

    // If player won, create win transaction
    if (outcome.won) {
      await Transaction.createAndProcess({
        userId,
        type: 'win',
        amount: outcome.payout,
        gameId: this._id,
        metadata: {
          gameName: this.name,
          multiplier: outcome.multiplier
        }
      });
    }

    // Update game statistics
    this.statistics.totalBets++;
    this.statistics.totalWagered += amount;
    if (outcome.won) {
      this.statistics.totalPayout += outcome.payout;
    }
    this.lastPlayed = new Date();
    await this.save({ session });

    await session.commitTransaction();
    return outcome;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Calculate game outcome (placeholder - implement specific game logic)
gameSchema.methods.calculateOutcome = async function(betAmount) {
  // This is a placeholder implementation
  // Each game should override this with its specific logic
  const random = Math.random();
  const won = random > (this.houseEdge / 100);
  
  return {
    won,
    multiplier: won ? 2 : 0,
    payout: won ? betAmount * 2 : 0
  };
};

// Static methods

// Get active games
gameSchema.statics.getActiveGames = function() {
  return this.find({ isActive: true })
    .sort({ lastPlayed: -1 });
};

// Get game statistics
gameSchema.statics.getStatistics = async function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        activeGames: { 
          $sum: { $cond: ['$isActive', 1, 0] }
        },
        totalBets: { $sum: '$statistics.totalBets' },
        totalWagered: { $sum: '$statistics.totalWagered' },
        totalPayout: { $sum: '$statistics.totalPayout' }
      }
    }
  ]);
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
