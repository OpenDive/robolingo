import UserService from '../../services/UserService';
import User from '../../models/User.model';
import { setupTestDB, clearTestDB } from '../utils';
import UserRepository from '../../repositories/UserRepository';
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import expect from 'expect';

describe('UserService', () => {
  let userService: UserService;

  beforeAll(async () => {
    await setupTestDB();
    userService = new UserService(new UserRepository());
  });

  afterAll(async () => {
    await clearTestDB();
  });

  describe('createUser', () => {
    it('should create a new user with required fields', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        walletAddress: '0x1234567890abcdef',
        friends: [],
        dailyProgress: {},
        streak: 0
      };

      const user = await userService.createUser(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
    });
  });
}); 
