import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/User.model';

/**
 * Instructor authentication middleware
 * Ensures the authenticated user has instructor or admin role
 * Must be used after the main auth middleware
 * 
 * @param req - Express request object with user data
 * @param res - Express response object
 * @param next - Express next function
 */
const instructorAuth = (req: Request, res: Response, next: NextFunction): void => {
  // Check if user exists and has instructor or admin role
  if (!req.user || (req.user.role !== UserRole.INSTRUCTOR && req.user.role !== UserRole.ADMIN)) {
    res.status(403).json({ message: 'Instructor access required' });
    return;
  }
  
  next();
};

export default instructorAuth;