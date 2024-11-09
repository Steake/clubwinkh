const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  periodStart: {
    type: Date,
    required: true
  },
  periodEnd: {
    type: Date,
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  totalWagered: {
    type: Number,
    default: 0
  },
  totalWon: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: String,
    enum: ['trophy', 'star']
  }],
  rank: {
    type: Number,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
leaderboardEntrySchema.index({ period: 1, periodStart: 1, periodEnd: 1 });
leaderboardEntrySchema.index({ period: 1, score: -1 });
leaderboardEntrySchema.index({ userId: 1, period: 1, periodStart: 1 }, { unique: true });

// Methods

// Update entry with game results
leaderboardEntrySchema.methods.updateWithGameResult = async function(gameResult) {
  this.gamesPlayed++;
  this.totalWagered += gameResult.wagered;
  this.totalWon += gameResult.won;
  
  // Calculate score based on various factors
  const profitScore = gameResult.won - gameResult.wagered;
  const volumeScore = gameResult.wagered * 0.1; // 10% weight to volume
  this.score += profitScore + volumeScore;

  this.lastActive = new Date();
  
  // Check and award achievements
  await this.checkAchievements();
  
  return this.save();
};

// Check and award achievements
leaderboardEntrySchema.methods.checkAchievements = async function() {
  // Trophy for high rollers
  if (this.totalWagered >= 1000000 && !this.achievements.includes('trophy')) {
    this.achievements.push('trophy');
  }
  
  // Star for consistent winners
  if (this.totalWon > this.totalWagered * 1.5 && !this.achievements.includes('star')) {
    this.achievements.push('star');
  }
};

// Static methods

// Get or create entry for a period
leaderboardEntrySchema.statics.getOrCreateEntry = async function(userId, period) {
  const { start, end } = calculatePeriodDates(period);
  
  let entry = await this.findOne({
    userId,
    period,
    periodStart: start,
    periodEnd: end
  });
  
  if (!entry) {
    entry = new this({
      userId,
      period,
      periodStart: start,
      periodEnd: end
    });
  }
  
  return entry;
};

// Get leaderboard for a period
leaderboardEntrySchema.statics.getLeaderboard = async function(period, limit = 100) {
  const { start, end } = calculatePeriodDates(period);
  
  const entries = await this.find({
    period,
    periodStart: start,
    periodEnd: end
  })
    .sort({ score: -1 })
    .limit(limit)
    .populate('userId', 'username');
  
  // Update ranks
  for (let i = 0; i < entries.length; i++) {
    entries[i].rank = i + 1;
    await entries[i].save();
  }
  
  return entries;
};

// Helper function to calculate period dates
function calculatePeriodDates(period) {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  
  switch (period) {
    case 'daily':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'weekly':
      start.setDate(now.getDate() - now.getDay());
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    case 'monthly':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;
  }
  
  return { start, end };
}

// Cleanup old entries (can be run periodically)
leaderboardEntrySchema.statics.cleanupOldEntries = async function() {
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  return this.deleteMany({
    periodEnd: { $lt: threeMonthsAgo }
  });
};

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

module.exports = LeaderboardEntry;
