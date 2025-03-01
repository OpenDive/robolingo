import request from 'supertest';
import app from '../../app';
import { setupTestDB, clearTestDB, createTestUser } from '../utils';
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import expect from 'expect';

describe('User Routes', () => {
  // Test user
  let testUser: any;

  beforeAll(async () => {
    await setupTestDB();
    // Create a test user
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await clearTestDB();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'Test',
          lastName: 'User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('test@example.com');
    });
  });
}); 