import { CreationAttributes } from 'sequelize/types/model';
import { Sequelize } from 'sequelize-typescript';
import { setupTestDb } from './testDatabase';
import { ModelCtor } from 'sequelize-typescript';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import User from '../models/User.model';
import { Secret, SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Sequelize instance for tests
let testSequelize: Sequelize | null = null;

/**
 * Setup a test database
 * Creates a new in-memory database for testing
 */
export const setupTestDB = async (): Promise<void> => {
  try {
    // Create a fresh database connection for each test suite
    if (testSequelize) {
      await testSequelize.close();
    }
    testSequelize = await setupTestDb();
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
};

/**
 * Clear and close the test database
 * Ensures connections are properly closed after tests
 */
export const clearTestDB = async (): Promise<void> => {
  try {
    if (testSequelize) {
      // For cleanup, we can either drop tables or close connection
      await testSequelize.close();
      testSequelize = null;
    }
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
};

/**
 * Get the test database instance
 * @returns The Sequelize instance used for tests
 */
export const getTestDB = (): Sequelize => {
  if (!testSequelize) {
    throw new Error('Test database not initialized. Call setupTestDB first.');
  }
  return testSequelize;
};

export const createTestData = async <T extends ModelCtor>(model: T, data: CreationAttributes<InstanceType<T>>) => {
  return model.create(data);
};

/**
 * Generate a valid JWT token for a test user
 * @param user User object to generate token for
 * @returns JWT token string
 */
export const generateAuthToken = (user: User): string => {
  const payload = {
    id: user.id,
    walletAddress: user.walletAddress
  };
  
  return jwt.sign(
    payload, 
    config.jwtSecret as Secret, 
    { expiresIn: config.jwtExpiresIn } as SignOptions
  );
};

/**
 * Clean up test data after tests
 */
export const cleanupTestData = async (): Promise<void> => {
  // Add cleanup logic as needed
};

/**
 * Creates a test user with default values for required fields
 */
export const createTestUser = async (overrides = {}) => {
  return User.create({
    email: `test-${uuidv4()}@example.com`,
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    walletAddress: `0x${uuidv4().replace(/-/g, '')}`,
    friends: [],
    dailyProgress: {},
    streak: 0,
    ...overrides
  });
};