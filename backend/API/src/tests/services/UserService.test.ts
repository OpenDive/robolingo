import UserService from '../../services/UserService';
import { User } from '../../models';
import { setupTestDB, clearTestDB } from '../utils';
import { describe, it } from 'node:test';
import UserRepository from '../../repositories/UserRepository';
import expect from 'expect';
import { beforeAll, afterAll } from '@jest/globals';

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
    it('should create a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe'
      };

      const user = await userService.createUser(userData);
      
      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
      expect(user.lastName).toBe(userData.lastName);
    });
  });
}); 
