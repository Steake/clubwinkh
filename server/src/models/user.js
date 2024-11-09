const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters long']
  },
  telegramId: {
    type: String,
    index: true  // Simple index, not unique
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'suspended'],
    default: 'active'
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  achievements: [{
    type: String,
    enum: ['trophy', 'star']
  }]
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update balance
userSchema.methods.updateBalance = async function(amount) {
  const newBalance = this.balance + amount;
  if (newBalance < 0) {
    throw new Error('Insufficient balance');
  }
  this.balance = newBalance;
  return this.save();
};

// Method to handle admin balance operations
userSchema.methods.adminBalanceOperation = async function(type, amount) {
  if (this.status === 'suspended') {
    throw new Error('Cannot perform operations on suspended account');
  }
  
  if (type === 'debit' && this.balance < amount) {
    throw new Error('Insufficient balance for debit operation');
  }
  
  const balanceChange = type === 'credit' ? amount : -amount;
  return this.updateBalance(balanceChange);
};

// Method to update user status
userSchema.methods.updateStatus = async function(newStatus) {
  if (!['active', 'suspended'].includes(newStatus)) {
    throw new Error('Invalid status');
  }
  this.status = newStatus;
  return this.save();
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find by Telegram ID
userSchema.statics.findByTelegramId = function(telegramId) {
  return this.findOne({ telegramId });
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ lastActive: -1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
