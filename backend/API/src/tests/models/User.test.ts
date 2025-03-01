import { setupTestDB, clearTestDB, getTestDB } from '../utils';
import User, { UserRole } from '../../models/User.model';
import { describe, it, beforeAll, afterAll } from '@jest/globals';
import expect from 'expect';
import { createTestUser } from '../utils';

describe('User Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await clearTestDB();
  });

  it('should create a new user with required fields', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'Test',
      lastName: 'User',
      role: UserRole.STUDENT,
      walletAddress: '0x1234567890abcdef',
      friends: [],
      dailyProgress: {},
      streak: 0
    };

    const user = await User.create(userData);

    expect(user).toBeDefined();
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
    expect(user.firstName).toBe(userData.firstName);
    expect(user.lastName).toBe(userData.lastName);
    expect(user.role).toBe(userData.role);
    expect(user.isActive).toBe(true); // Default value
    
    // Password should be hashed, not plain text
    expect(user.password).not.toBe(userData.password);
  });

  it('should hash password on creation', async () => {
    const user = await User.create({
      email: 'password-test@example.com',
      password: 'Password123!',
      firstName: 'Hash',
      lastName: 'Test',
      walletAddress: '0xabcdef1234567890',
      friends: [],
      dailyProgress: {},
      streak: 0
    });

    expect(user.password).not.toBe('Password123!');
    // Should be able to verify password
    const isMatch = await user.comparePassword('Password123!');
    expect(isMatch).toBe(true);
  });

  it('should support wallet-based authentication', async () => {
    const walletAddress = '0x1234567890abcdef1234567890abcdef12345678';
    
    const user = await createTestUser({ walletAddress });
    
    expect(user).toBeDefined();
    expect(user.walletAddress).toBe(walletAddress);
  });

  // Add more tests as needed
}); 