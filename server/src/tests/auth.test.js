const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/user');

let mongoServer;

beforeAll(async () => {
  // Disconnect from any existing connection
  await mongoose.disconnect();
  
  // Create an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Explicitly clear ALL collections
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Auth API', () => {
  describe('POST /api/v1/auth/telegram-login', () => {
    const mockTelegramInitData = JSON.stringify({
      user: {
        id: '12345',
        username: 'testuser',
        first_name: 'Test',
        last_name: 'User'
      },
      hash: 'mockedhash'
    });

    it('should create a new user via Telegram login', async () => {
      const res = await request(app)
        .post('/api/v1/auth/telegram-login')
        .send({ initData: mockTelegramInitData });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', '12345@telegram.clubwinkh.com');
      expect(res.body.user).toHaveProperty('username', 'testuser');
      expect(res.body.user).toHaveProperty('role', 'user');
    });

    it('should login existing Telegram user', async () => {
      // First, create a user with Telegram ID
      await User.create({
        email: '12345@telegram.clubwinkh.com',
        username: 'testuser',
        password: 'temporarypassword',
        telegramId: '12345'
      });

      const res = await request(app)
        .post('/api/v1/auth/telegram-login')
        .send({ initData: mockTelegramInitData });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('telegramId', '12345');
    });

    it('should reject invalid Telegram init data', async () => {
      const res = await request(app)
        .post('/api/v1/auth/telegram-login')
        .send({ initData: '' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/auth/link-telegram', () => {
    let existingUser;

    beforeEach(async () => {
      existingUser = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'existinguser'
      });
    });

    const mockTelegramInitData = JSON.stringify({
      user: {
        id: '12345',
        username: 'telegramuser',
        first_name: 'Telegram',
        last_name: 'User'
      },
      hash: 'mockedhash'
    });

    it('should link Telegram to existing account', async () => {
      const res = await request(app)
        .post('/api/v1/auth/link-telegram')
        .send({
          email: 'test@example.com',
          password: 'password123',
          telegramInitData: mockTelegramInitData
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('telegramId', '12345');
    });

    it('should reject link with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/link-telegram')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
          telegramInitData: mockTelegramInitData
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });

    it('should prevent linking Telegram ID to multiple accounts', async () => {
      // First, link Telegram to an existing account
      await User.findByIdAndUpdate(existingUser._id, { 
        telegramId: '12345' 
      });

      // Try to link same Telegram ID to another account
      const anotherUser = await User.create({
        email: 'another@example.com',
        password: 'password123',
        username: 'anotheruser'
      });

      const res = await request(app)
        .post('/api/v1/auth/link-telegram')
        .send({
          email: 'another@example.com',
          password: 'password123',
          telegramInitData: mockTelegramInitData
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('error', 'Telegram account already linked to another user');
    });
  });
});
