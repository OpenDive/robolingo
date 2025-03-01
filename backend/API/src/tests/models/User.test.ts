import { User } from '../../models';
import { setupTestDB, clearTestDB } from '../utils';
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import expect from 'expect';

describe('User Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await clearTestDB();
  });

  it('should create a new user', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      walletAddress: '0x1234567890abcdef',
      friends: [],
      dailyProgress: {},
      streak: 0
    });
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
    expect(user.firstName).toBe('John');
    expect(user.lastName).toBe('Doe');
    expect(user.walletAddress).toBe('0x1234567890abcdef');
    expect(user.friends).toEqual([]);
    expect(user.dailyProgress).toEqual({});
    expect(user.streak).toBe(0);
  });
}); 