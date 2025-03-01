import { Op } from 'sequelize';
import BaseRepository from './BaseRepository';
import { User } from '../models';
import { UserRole } from '../models/User';

/**
 * Repository for User-specific data operations
 * Extends BaseRepository with additional user-focused methods
 */
class UserRepository extends BaseRepository<User> {
  constructor() {
    super(User);
  }

  /**
   * Find a user by email address
   * @param email - Email address to search for
   * @returns Promise resolving to user or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email }
    });
  }

  /**
   * Find users by role
   * @param role - User role to filter by
   * @returns Promise resolving to array of users
   */
  async findByRole(role: UserRole): Promise<User[]> {
    return this.findAll({
      where: { role }
    });
  }

  /**
   * Find users with query on name or email
   * @param query - Search string to match against name or email
   * @returns Promise resolving to array of matching users
   */
  async search(query: string): Promise<User[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${query}%` } },
          { lastName: { [Op.iLike]: `%${query}%` } },
          { email: { [Op.iLike]: `%${query}%` } }
        ]
      }
    });
  }

  /**
   * Find active instructors
   * @returns Promise resolving to array of instructor users
   */
  async findActiveInstructors(): Promise<User[]> {
    return this.findAll({
      where: {
        role: UserRole.INSTRUCTOR,
        isActive: true
      },
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });
  }

  /**
   * Update user's last login timestamp
   * @param userId - ID of the user
   * @returns Promise resolving when update completes
   */
  async updateLastLogin(userId: string): Promise<void> {
    await this.update(userId, {
      lastLogin: new Date()
    });
  }

  /**
   * Check if email is already registered
   * @param email - Email to check
   * @returns Promise resolving to boolean indicating if email exists
   */
  async isEmailTaken(email: string): Promise<boolean> {
    const count = await this.count({
      where: { email }
    });
    return count > 0;
  }

  /**
   * Activate or deactivate a user account
   * @param userId - ID of the user
   * @param isActive - Whether to activate (true) or deactivate (false)
   * @returns Promise resolving when update completes
   */
  async setActiveStatus(userId: string, isActive: boolean): Promise<void> {
    await this.update(userId, { isActive });
  }

  /**
   * Change a user's role
   * @param userId - ID of the user
   * @param newRole - New role to assign
   * @returns Promise resolving when update completes
   */
  async changeRole(userId: string, newRole: UserRole): Promise<void> {
    await this.update(userId, { role: newRole });
  }
}

export default UserRepository;