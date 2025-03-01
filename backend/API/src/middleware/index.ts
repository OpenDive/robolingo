/**
 * Middleware index file
 * Exports all middleware for easy importing
 */

// Authentication middleware
export { default as auth } from './Auth';
export { default as adminAuth } from './AdminAuth';
export { default as instructorAuth } from './InstructorAuth';

// Error handling middleware
export { default as errorHandler, ApiError } from './ErrorHandler';

// Rate limiting middleware
export { defaultLimiter, authLimiter, loginLimiter } from './RateLimit';

// Validation middleware
export { validate } from './Validator';