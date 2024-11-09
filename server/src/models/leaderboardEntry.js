const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
    required: true,
    index: true
  },
  period: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    index: -1
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
leaderboardEntrySchema.index({ period: 1, score: -1 });
leaderboardEntrySchema.index({ userId: 1, period: 1 });
leaderboardEntrySchema.index({ userId: 1, period: 1, gameId: 1 }, { unique: true });

// Static methods

// Get top scores for a period
leaderboardEntrySchema.statics.getTopScores = function(period, limit = 10) {
  return this.find({ period })
    .sort({ score: -1 })
    .limit(limit)
    .populate('userId', 'username');
};

// Get user's rank for a period
leaderboardEntrySchema.statics.getUserRank = async function(userId, period) {
  const entry = await this.findOne({ userId, period });
  if (!entry) return null;

  const rank = await this.countDocuments({
    period,
    score: { $gt: entry.score }
  });

  return rank + 1;
};

// Get user's positions across all periods
leaderboardEntrySchema.statics.getUserPositions = async function(userId) {
  const periods = ['daily', 'weekly', 'monthly'];
  const positions = await Promise.all(
    periods.map(async (period) => {
      const entry = await this.findOne({ userId, period });
      if (!entry) {
        return { period, rank: null, score: 0 };
      }

      const rank = await this.getUserRank(userId, period);
      return {
        period,
        rank,
        score: entry.score
      };
    })
  );

  return positions;
};

// Update or create entry with max score
leaderboardEntrySchema.statics.updateMaxScore = async function(data) {
  const { userId, period, gameId, score } = data;

  return this.findOneAndUpdate(
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
};

const LeaderboardEntry = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);

module.exports = LeaderboardEntry;
