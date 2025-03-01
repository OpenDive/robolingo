import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import BaseService from './BaseService';
import { EnrollmentStatus } from '../models/Enrollment.model';
import Enrollment from '../models/Enrollment.model';
import EnrollmentRepository from '../repositories/EnrollmentRepository';
import CourseRepository from '../repositories/CourseRepository';
import ProgressRepository from '../repositories/ProgressRepository';

/**
 * Service for enrollment-related operations
 */
class EnrollmentService extends BaseService<Enrollment, EnrollmentRepository> {
  private courseRepository: CourseRepository;
  private progressRepository: ProgressRepository;

  /**
   * Create service with required repositories
   * @param enrollmentRepository - Repository for enrollment operations
   * @param courseRepository - Repository for course operations
   * @param progressRepository - Repository for progress operations
   */
  constructor(
    enrollmentRepository: EnrollmentRepository,
    courseRepository: CourseRepository,
    progressRepository: ProgressRepository
  ) {
    super(enrollmentRepository);
    this.courseRepository = courseRepository;
    this.progressRepository = progressRepository;
  }

  /**
   * Get user enrollments with course details
   * @param userId - ID of the user
   * @param status - Optional status filter
   * @returns Promise resolving to array of enrollments
   */
  async getUserEnrollments(userId: string, status?: EnrollmentStatus): Promise<Enrollment[]> {
    return this.repository.findByUser(userId, status);
  }

  /**
   * Get enrollments for a specific course
   * @param courseId - ID of the course
   * @param status - Optional status filter
   * @returns Promise resolving to array of enrollments
   */
  async getCourseEnrollments(courseId: string, status?: EnrollmentStatus): Promise<Enrollment[]> {
    return this.repository.findByCourse(courseId, status);
  }

  /**
   * Check if a user is enrolled in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to boolean indicating enrollment status
   */
  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    return this.repository.isUserEnrolled(userId, courseId);
  }

  /**
   * Enroll a user in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @param paymentId - Optional payment reference ID
   * @param expiresAt - Optional expiration date
   * @returns Promise resolving to the created enrollment
   * @throws Error if enrollment fails or user is already enrolled
   */
  async enrollUserInCourse(
    userId: string,
    courseId: string,
    paymentId?: string,
    expiresAt?: Date
  ): Promise<Enrollment> {
    const transaction = await sequelize.transaction();

    try {
      // Check if user is already enrolled
      const isEnrolled = await this.repository.isUserEnrolled(userId, courseId);
      if (isEnrolled) {
        await transaction.rollback();
        throw new Error('User is already enrolled in this course');
      }

      // Create enrollment
      const enrollment = await this.repository.create({
        userId,
        courseId,
        paymentId,
        expiresAt,
        status: EnrollmentStatus.ACTIVE,
        progress: 0,
        certificateIssued: false
      }, { transaction });

      // Increment course enrollment count
      await this.courseRepository.incrementEnrollment(courseId);

      // Commit transaction
      await transaction.commit();
      return enrollment;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Update user progress in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @param newProgress - New progress percentage (0-100)
   * @returns Promise resolving to boolean indicating success
   */
  async updateProgress(userId: string, courseId: string, newProgress: number): Promise<boolean> {
    try {
      await this.repository.updateProgress(userId, courseId, newProgress);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Mark a course as completed for a user
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to boolean indicating success
   */
  async markCourseAsCompleted(userId: string, courseId: string): Promise<boolean> {
    try {
      await this.repository.markAsCompleted(userId, courseId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Cancel an enrollment (refund)
   * @param enrollmentId - ID of the enrollment
   * @returns Promise resolving to boolean indicating success
   */
  async cancelEnrollment(enrollmentId: string): Promise<boolean> {
    const enrollment = await this.repository.findById(enrollmentId);
    
    if (!enrollment) {
      return false;
    }
    
    try {
      enrollment.processRefund();
      await enrollment.save();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Issue a certificate for a completed course
   * @param enrollmentId - ID of the enrollment
   * @param certificateUrl - URL to the generated certificate
   * @returns Promise resolving to boolean indicating success
   */
  async issueCertificate(enrollmentId: string, certificateUrl: string): Promise<boolean> {
    try {
      await this.repository.issueCertificate(enrollmentId, certificateUrl);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Calculate and update overall progress for a user in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to new progress percentage
   */
  async calculateAndUpdateProgress(userId: string, courseId: string): Promise<number> {
    // Get enrollment to update
    const enrollment = await this.findOne({
      where: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE
      }
    });
    
    if (!enrollment) {
      throw new Error('Active enrollment not found');
    }
    
    // Calculate overall progress from individual lecture progress
    const overallProgress = await this.progressRepository.calculateCourseProgress(userId, courseId);
    
    // Update enrollment progress
    await this.repository.updateProgress(userId, courseId, overallProgress);
    
    return overallProgress;
  }

  /**
   * Reset user progress in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to boolean indicating success
   */
  async resetCourseProgress(userId: string, courseId: string): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // Reset enrollment progress
      const enrollment = await this.findOne({
        where: {
          userId,
          courseId
        },
        transaction
      });
      
      if (!enrollment) {
        await transaction.rollback();
        return false;
      }
      
      // Update enrollment status and progress
      await this.update(enrollment.id, {
        progress: 0,
        status: EnrollmentStatus.ACTIVE,
        completedAt: null
      });
      
      // Reset individual lecture progress
      await this.progressRepository.resetCourseProgress(userId, courseId);
      
      // Commit transaction
      await transaction.commit();
      return true;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      return false;
    }
  }

  /**
   * Check for and update expired enrollments
   * @returns Promise resolving to number of enrollments updated
   */
  async processExpiredEnrollments(): Promise<number> {
    return this.repository.checkExpiredEnrollments();
  }

  /**
   * Get a single enrollment for a user and course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to the enrollment or null if not found
   */
  async getUserEnrollment(userId: string, courseId: string): Promise<Enrollment | null> {
    return Enrollment.findOne({
      where: { userId, courseId }
    });
  }
}

export default EnrollmentService;