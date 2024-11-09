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
  status: {
    type: String,
    enum: ['active', 'maintenance', 'disabled'],
    default: 'active',
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  minBet: {
    type: Number,
    required: true,
    min: 0
  },
  maxBet: {
    type: Number,
    required: true,
    min: 0
  },
  payoutRatio: {
    type: Number,
    required: true,
    min: 0
  },
  settings: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes
gameSchema.index({ name: 'text', description: 'text' });
gameSchema.index({ type: 1, status: 1 });

// Methods

// Check if game is available for play
gameSchema.methods.isPlayable = function() {
  return this.status === 'active';
};

// Validate bet amount
gameSchema.methods.validateBet = function(amount) {
  return amount >= this.minBet && amount <= this.maxBet;
};

// Calculate potential payout
gameSchema.methods.calculatePayout = function(betAmount, multiplier = 1) {
  return betAmount * this.payoutRatio * multiplier;
};

// Static methods

// Get active games
gameSchema.statics.getActive = function() {
  return this.find({ status: 'active' });
};

// Get games by type
gameSchema.statics.getByType = function(type) {
  return this.find({ type, status: 'active' });
};

// Search games
gameSchema.statics.search = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'active'
  });
};

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
