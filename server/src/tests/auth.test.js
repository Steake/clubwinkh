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
  // Clear all collections before each test
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

describe('Auth API', () => {
  describe('POST /api/v1/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('username', 'testuser');
      expect(res.body.user).toHaveProperty('role', 'user');
    });

    it('should register an admin user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@example.com',
          password: 'admin123',
          username: 'admin',
          role: 'admin'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.user).toHaveProperty('role', 'admin');
    });

    it('should not allow duplicate emails', async () => {
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'existinguser'
      });

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          username: 'testuser'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('error', 'Email already registered');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    beforeEach(async () => {
      await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('GET /api/v1/auth/profile', () => {
    let token;
    let user;

    beforeEach(async () => {
      user = await User.create({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser'
      });
      token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-secret');
    });

    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toHaveProperty('email', 'test@example.com');
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/profile');

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error', 'No token provided');
    });
  });
});
