const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

class TelegramAuthService {
  // Validate Telegram initialization data
  validateTelegramInitData(initData) {
    // Placeholder for Telegram WebApp data validation
    if (!initData) {
      throw new Error('Invalid Telegram initialization data');
    }
    return true;
  }

  // Extract user information from Telegram init data
  extractTelegramUserData(initData) {
    // Simplified example - in production, parse actual Telegram init data
    const parsedData = this.parseTelegramInitData(initData);

    return {
      telegramId: parsedData.user.id.toString(),
      username: parsedData.user.username || parsedData.user.first_name,
      email: `${parsedData.user.id}@telegram.clubwinkh.com`
    };
  }

  // Parse Telegram initialization data
  parseTelegramInitData(initData) {
    try {
      return JSON.parse(initData);
    } catch (error) {
      throw new Error('Failed to parse Telegram initialization data');
    }
  }

  // Login or create user via Telegram
  async telegramLogin(initData) {
    this.validateTelegramInitData(initData);
    const telegramUserData = this.extractTelegramUserData(initData);

    // Check if user exists by Telegram ID
    let user = await User.findOne({ telegramId: telegramUserData.telegramId });

    const isNewUser = !user;

    if (!user) {
      // Create new user if not exists
      user = new User({
        ...telegramUserData,
        role: 'user',
        status: 'active',
        password: crypto.randomBytes(16).toString('hex') // Random password for Telegram users
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return { 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
        telegramId: user.telegramId,
        isNewUser: isNewUser
      }
    };
  }

  // Link existing account to Telegram
  async linkTelegramToAccount(email, password, telegramInitData) {
    this.validateTelegramInitData(telegramInitData);
    const telegramUserData = this.extractTelegramUserData(telegramInitData);

    // Find user by email and verify password
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if Telegram ID is already linked to another account
    const existingTelegramUser = await User.findOne({ 
      telegramId: telegramUserData.telegramId,
      _id: { $ne: user._id } 
    });

    if (existingTelegramUser) {
      throw new Error('Telegram account already linked to another user');
    }

    // Link Telegram ID to user account
    user.telegramId = telegramUserData.telegramId;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return { 
      token, 
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: user.role,
        balance: user.balance,
        telegramId: user.telegramId
      }
    };
  }
}

module.exports = new TelegramAuthService();
