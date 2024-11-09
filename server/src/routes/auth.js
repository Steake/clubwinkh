const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { generateToken } = require('../middleware/auth');
const telegramAuthService = require('../services/telegramAuthService');

const router = express.Router();

// Existing routes remain the same...

// Telegram Login
router.post('/telegram-login', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'Telegram initialization data is required' });
    }

    const result = await telegramAuthService.telegramLogin(initData);
    
    res.status(result.user.isNewUser ? 201 : 200).json(result);
  } catch (error) {
    console.error('Telegram login error:', error.message);
    
    if (error.message === 'Invalid Telegram initialization data') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Telegram login failed' });
  }
});

// Link Telegram to Existing Account
router.post('/link-telegram', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists(),
  body('telegramInitData').exists()
], async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, telegramInitData } = req.body;

    const result = await telegramAuthService.linkTelegramToAccount(
      email, 
      password, 
      telegramInitData
    );

    res.json(result);
  } catch (error) {
    console.error('Telegram account link error:', error.message);
    
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({ error: error.message });
    }
    
    if (error.message === 'Telegram account already linked to another user') {
      return res.status(409).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Failed to link Telegram account' });
  }
});

module.exports = router;
