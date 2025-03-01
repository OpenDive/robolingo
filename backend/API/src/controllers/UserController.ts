import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { UserService } from '../services';
import { UserRole } from '../models/User.model';
import User from '../models/User.model';

/**
 * Controller for user-related API endpoints
 * Handles authentication, registration, and profile management
 */
class UserController extends BaseController<any> {
  private userService: UserService;

  /**
   * Creates a controller with the UserService
   * @param userService - Service for user operations
   */
  constructor(userService: UserService) {
    super(userService);
    this.userService = userService;
  }

  /**
   * Register a new user
   * @param req - Express request with user registration data
   * @param res - Express response object
   * @param next - Express next function
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password, firstName, lastName, role, bio, profileImage } = req.body;
      
      const user = await this.userService.createUser({
        email,
        password,
        firstName,
        lastName,
        role,
        bio,
        profileImage
      });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user.toJSON();
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof Error && error.message === 'Email is already registered') {
        res.status(409).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * User login (authentication)
   * @param req - Express request with login credentials
   * @param res - Express response object
   * @param next - Express next function
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { walletAddress, signature } = req.body;
      
      // Verify signature logic here
      const user = await User.findOne({ where: { walletAddress } });
      
      if (!user) {
        // Auto-create user if not exists
        const newUser = await User.create({
            walletAddress,
            friends: [],
            dailyProgress: {},
            streak: 0
        });
        res.json(newUser);
        return;
      }

      res.json(user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user profile
   * @param req - Express request with authenticated user
   * @param res - Express response object
   * @param next - Express next function
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Assumes that authentication middleware adds user object to request
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const user = await this.userService.findById(userId);
      
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user.toJSON();
      
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user profile
   * @param req - Express request with authenticated user and profile updates
   * @param res - Express response object
   * @param next - Express next function
   */
  updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Assumes that authentication middleware adds user object to request
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const { firstName, lastName, bio, profileImage } = req.body;
      
      const updatedUser = await this.userService.updateProfile(userId, {
        firstName,
        lastName,
        bio,
        profileImage
      });
      
      if (!updatedUser) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser.toJSON();
      
      res.json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change user password
   * @param req - Express request with password change data
   * @param res - Express response object
   * @param next - Express next function
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Assumes that authentication middleware adds user object to request
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const { currentPassword, newPassword } = req.body;
      
      const success = await this.userService.changePassword(
        userId,
        currentPassword,
        newPassword
      );
      
      if (!success) {
        res.status(400).json({ message: 'Failed to change password' });
        return;
      }
      
      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Current password is incorrect') {
          res.status(400).json({ message: error.message });
          return;
        }
        if (error.message === 'User not found') {
          res.status(404).json({ message: error.message });
          return;
        }
      }
      next(error);
    }
  };

  /**
   * Get users by role (admin only)
   * @param req - Express request with role parameter
   * @param res - Express response object
   * @param next - Express next function
   */
  getUsersByRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const role = req.params.role as UserRole;
      
      // Validate role parameter
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ message: 'Invalid role' });
        return;
      }
      
      const users = await this.userService.getUsersByRole(role);
      
      // Remove passwords from response
      const sanitizedUsers = users.map(user => {
        const { password: _, ...userWithoutPassword } = user.toJSON();
        return userWithoutPassword;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set user active status (admin only)
   * @param req - Express request with user ID and active status
   * @param res - Express response object
   * @param next - Express next function
   */
  setActiveStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const userId = req.params.id;
      const { isActive } = req.body;
      
      if (typeof isActive !== 'boolean') {
        res.status(400).json({ message: 'isActive must be a boolean' });
        return;
      }
      
      const success = await this.userService.setActiveStatus(userId, isActive);
      
      if (!success) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.json({ message: `User ${isActive ? 'activated' : 'deactivated'} successfully` });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Change user role (admin only)
   * @param req - Express request with user ID and new role
   * @param res - Express response object
   * @param next - Express next function
   */
  changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const userId = req.params.id;
      const { role } = req.body;
      
      // Validate role parameter
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({ message: 'Invalid role' });
        return;
      }
      
      const success = await this.userService.changeRole(userId, role);
      
      if (!success) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
      
      res.json({ message: 'User role updated successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default UserController;