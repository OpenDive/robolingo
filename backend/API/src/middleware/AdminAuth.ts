import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User';

/**
 * Admin authentication middleware
 * Ensures the authenticated user has admin role
 * Must be used after the main auth middleware
 * 
 * @param req - Express request object with user data
 * @param res - Express response object
 * @param next - Express next function
 */
const adminAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user exists and has admin role
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }
  
  next();
};

export default adminAuth;