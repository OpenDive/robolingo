import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ 
  path: path.join(__dirname, '../../.env.test'),
  override: true 
});

// Set testing environment
process.env.NODE_ENV = 'test';

// Import test configuration
import '../config/testEnv';

/**
 * Global setup for tests
 */
beforeAll(async () => {
  // No need to do anything here, each test file will set up its own database
  console.log('Test environment setup complete');
});

/**
 * Global teardown for tests
 */
afterAll(async () => {
  // No need to do anything here, each test file will clean up its own database
}); 