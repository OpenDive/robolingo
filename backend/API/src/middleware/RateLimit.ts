import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Default rate limiter for anonymous requests
 * Limits requests to 30 per minute
 */
export const defaultLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    error: 'Too many requests, please try again later',
  },
  keyGenerator: (req: Request) => req.ip || 'unknown', // Use IP address as key
});

/**
 * Authenticated user rate limiter
 * Limits requests to 60 per minute for authenticated users
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests, please try again later',
  },
  // Use user ID if authenticated, otherwise IP address
  keyGenerator: (req: Request) => {
    return req.user?.id || req.ip || 'unknown';
  },
  // Skip if in development environment
  skip: (req: Request) => process.env.NODE_ENV === 'development',
});

/**
 * Login attempt rate limiter
 * Protects against brute force attacks
 * Limits login attempts to 5 per 15 minutes
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login attempts, please try again after 15 minutes',
  },
  keyGenerator: (req: Request) => req.ip || 'unknown',
});