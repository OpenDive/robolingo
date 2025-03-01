import { syncDatabase } from '../config/database';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.test file
dotenv.config({ path: path.join(__dirname, '../../.env.test') });

// Global setup before all tests
beforeAll(async () => {
  try {
    // Force sync database in test mode
    await syncDatabase(true);
    console.log('Test environment setup complete');
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

// Global teardown after all tests
afterAll(async () => {
  // Any cleanup code here
  console.log('Test environment teardown complete');
}); 