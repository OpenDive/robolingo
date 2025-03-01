import jwt from 'jsonwebtoken';
import BaseService from './BaseService';
import { User } from '../models';
import { UserRole } from '../models/User';
import UserRepository from '../repositories/UserRepository';
import { config } from '../config/env';

/**
 * Service for user-related operations including authentication
 */
class UserService extends BaseService<User, UserRepository> {
  /**
   * Create a new user with validation and password hashing
   * @param userData - User data with password in plain text
   * @returns Promise resolving to created user
   * @throws Error if validation fails
   */
  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
    bio?: string;
    profileImage?: string;
  }): Promise<User> {
    // Check if email already exists
    const existingUser = await this.repository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email is already registered');
    }

    // Create user (password is hashed in model hooks)
    return this.repository.create(userData);
  }

  /**
   * Authenticate user and generate JWT token
   * @param email - User email
   * @param password - User password (plain text)
   * @returns Promise resolving to authenticated user and token
   * @throws Error if authentication fails
   */
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await this.repository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Check if user account is active
    if (!user.isActive) {
      throw new Error('Account is inactive. Please contact support.');
    }

    // Update last login time
    await this.repository.updateLastLogin(user.id);

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Search for users by name or email
   * @param query - Search query string
   * @returns Promise resolving to array of matching users
   */
  async searchUsers(query: string): Promise<User[]> {
    return this.repository.search(query);
  }

  /**
   * Find users by role
   * @param role - User role to filter by
   * @returns Promise resolving to array of users with the specified role
   */
  async getUsersByRole(role: UserRole): Promise<User[]> {
    return this.repository.findByRole(role);
  }

  /**
   * Change user password with validation
   * @param userId - User ID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password to set
   * @returns Promise resolving to boolean indicating success
   * @throws Error if validation fails
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Find user
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Validate current password
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Update password (hashing is handled in model hooks)
    const [affectedCount] = await this.repository.update(userId, { password: newPassword });
    return affectedCount > 0;
  }

  /**
   * Update user profile information
   * @param userId - User ID
   * @param profileData - Profile data to update
   * @returns Promise resolving to updated user or null if not found
   */
  async updateProfile(userId: string, profileData: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    profileImage?: string;
  }): Promise<User | null> {
    return this.update(userId, profileData);
  }

  /**
   * Set user active status (activate/deactivate account)
   * @param userId - User ID
   * @param isActive - Whether account should be active
   * @returns Promise resolving to boolean indicating success
   */
  async setActiveStatus(userId: string, isActive: boolean): Promise<boolean> {
    try {
      await this.repository.setActiveStatus(userId, isActive);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Change user role (admin function)
   * @param userId - User ID
   * @param newRole - New role to assign
   * @returns Promise resolving to boolean indicating success
   */
  async changeRole(userId: string, newRole: UserRole): Promise<boolean> {
    try {
      await this.repository.changeRole(userId, newRole);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Private helper methods

  /**
   * Generate JWT token for authenticated user
   * @param user - User to generate token for
   * @returns JWT token string
   */
  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    } as jwt.SignOptions);
  }
}

export default UserService;