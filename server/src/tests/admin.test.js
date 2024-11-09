const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/user');
const Transaction = require('../models/transaction');

let mongoServer;
let adminToken;
let adminUser;
let regularUser;

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
  await User.deleteMany({});
  await Transaction.deleteMany({});

  // Create admin user
  adminUser = await User.create({
    email: 'admin@example.com',
    password: 'admin123',
    username: 'admin',
    role: 'admin'
  });
  adminToken = jwt.sign({ userId: adminUser._id }, process.env.JWT_SECRET || 'test-secret');

  // Create regular user
  regularUser = await User.create({
    email: 'user@example.com',
    password: 'password123',
    username: 'user',
    status: 'active'
  });
});

describe('Admin API', () => {
  describe('GET /api/v1/admin/users', () => {
    it('should list all users for admin', async () => {
      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.users).toHaveLength(2);
      expect(res.body.users[0]).toHaveProperty('email');
      expect(res.body.users[0]).toHaveProperty('username');
      expect(res.body.users[0]).toHaveProperty('role');
    });

    it('should filter users by status', async () => {
      await User.findByIdAndUpdate(regularUser._id, { status: 'suspended' });

      const res = await request(app)
        .get('/api/v1/admin/users?status=suspended')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(res.body.users[0].status).toBe('suspended');
    });
  });

  describe('PATCH /api/v1/admin/users/:userId/status', () => {
    it('should update user status', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${regularUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'suspended' });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.status).toBe('suspended');

      const updatedUser = await User.findById(regularUser._id);
      expect(updatedUser.status).toBe('suspended');
    });

    it('should not allow invalid status', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/users/${regularUser._id}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/v1/admin/users/:userId/balance', () => {
    it('should credit user balance', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${regularUser._id}/balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'credit',
          amount: 1000,
          description: 'Test credit'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.balance).toBe(1000);

      const transaction = await Transaction.findOne({ userId: regularUser._id });
      expect(transaction).toBeTruthy();
      expect(transaction.type).toBe('credit');
      expect(transaction.amount).toBe(1000);
      expect(transaction.status).toBe('completed');
    });

    it('should debit user balance', async () => {
      // First credit the user
      await request(app)
        .post(`/api/v1/admin/users/${regularUser._id}/balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'credit',
          amount: 1000,
          description: 'Initial credit'
        });

      // Then debit
      const res = await request(app)
        .post(`/api/v1/admin/users/${regularUser._id}/balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'debit',
          amount: 500,
          description: 'Test debit'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.balance).toBe(500);

      const transactions = await Transaction.find({ userId: regularUser._id });
      expect(transactions).toHaveLength(2);
      expect(transactions[1].type).toBe('debit');
      expect(transactions[1].amount).toBe(-500);
    });

    it('should not allow debit more than balance', async () => {
      const res = await request(app)
        .post(`/api/v1/admin/users/${regularUser._id}/balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'debit',
          amount: 1000,
          description: 'Test debit'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Insufficient balance');
    });

    it('should not allow operations on suspended users', async () => {
      // First suspend the user
      await User.findByIdAndUpdate(regularUser._id, { status: 'suspended' });

      const res = await request(app)
        .post(`/api/v1/admin/users/${regularUser._id}/balance`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          type: 'credit',
          amount: 1000,
          description: 'Test credit'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe('Cannot process transaction for suspended user');
    });
  });

  describe('GET /api/v1/admin/users/:userId/transactions', () => {
    beforeEach(async () => {
      // Create some test transactions
      await Transaction.create([
        {
          userId: regularUser._id,
          type: 'credit',
          amount: 1000,
          description: 'Initial credit',
          status: 'completed',
          createdAt: new Date()
        },
        {
          userId: regularUser._id,
          type: 'debit',
          amount: -500,
          description: 'Test debit',
          status: 'completed',
          createdAt: new Date()
        }
      ]);
    });

    it('should list user transactions', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${regularUser._id}/transactions`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.transactions).toHaveLength(2);
      expect(res.body.transactions[0]).toHaveProperty('type');
      expect(res.body.transactions[0]).toHaveProperty('amount');
      expect(res.body.transactions[0]).toHaveProperty('description');
    });

    it('should filter transactions by type', async () => {
      const res = await request(app)
        .get(`/api/v1/admin/users/${regularUser._id}/transactions?type=credit`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.transactions).toHaveLength(1);
      expect(res.body.transactions[0].type).toBe('credit');
    });

    it('should filter transactions by date range', async () => {
      const startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);

      const res = await request(app)
        .get(`/api/v1/admin/users/${regularUser._id}/transactions`)
        .query({
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.transactions).toHaveLength(2);
    });
  });
});
