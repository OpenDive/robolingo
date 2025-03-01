import { Op } from 'sequelize';
import BaseRepository from './BaseRepository';
import Enrollment from '../models/Enrollment.model';
import { EnrollmentStatus } from '../models/Enrollment.model';
import Course from '../models/Course.model';
import User from '../models/User.model';

/**
 * Repository for Enrollment-specific data operations
 */
class EnrollmentRepository extends BaseRepository<Enrollment> {
  constructor() {
    super(Enrollment);
  }

  /**
   * Find enrollments for a specific user
   * @param userId - ID of the user
   * @param status - Optional filter by enrollment status
   * @returns Promise resolving to array of enrollments
   */
  async findByUser(userId: string, status?: EnrollmentStatus): Promise<Enrollment[]> {
    const whereClause: any = { userId };
    
    if (status) {
      whereClause.status = status;
    }

    return this.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'thumbnailUrl', 'level', 'targetLanguage']
        }
      ],
      order: [['enrolledAt', 'DESC']]
    });
  }

  /**
   * Find enrollments for a specific course
   * @param courseId - ID of the course
   * @param status - Optional filter by enrollment status
   * @returns Promise resolving to array of enrollments
   */
  async findByCourse(courseId: string, status?: EnrollmentStatus): Promise<Enrollment[]> {
    const whereClause: any = { courseId };
    
    if (status) {
      whereClause.status = status;
    }

    return this.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['enrolledAt', 'DESC']]
    });
  }

  /**
   * Check if a user is enrolled in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to boolean indicating enrollment status
   */
  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const enrollment = await this.findOne({
      where: {
        userId,
        courseId,
        status: {
          [Op.in]: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED]
        }
      }
    });
    
    return !!enrollment;
  }

  /**
   * Update a user's progress in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @param newProgress - New progress percentage (0-100)
   * @returns Promise resolving when the update completes
   */
  async updateProgress(userId: string, courseId: string, newProgress: number): Promise<void> {
    const enrollment = await this.findOne({
      where: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE
      }
    });
    
    if (enrollment) {
      enrollment.updateProgress(newProgress);
      await enrollment.save();
    }
  }

  /**
   * Mark a course as completed for a user
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving when the update completes
   */
  async markAsCompleted(userId: string, courseId: string): Promise<void> {
    const enrollment = await this.findOne({
      where: {
        userId,
        courseId,
        status: EnrollmentStatus.ACTIVE
      }
    });
    
    if (enrollment) {
      enrollment.markAsCompleted();
      await enrollment.save();
    }
  }

  /**
   * Check for and update expired enrollments
   * @returns Promise resolving to number of enrollments marked as expired
   */
  async checkExpiredEnrollments(): Promise<number> {
    const expiredEnrollments = await this.findAll({
      where: {
        status: EnrollmentStatus.ACTIVE,
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });
    
    const updatePromises = expiredEnrollments.map(enrollment => {
      enrollment.markAsExpired();
      return enrollment.save();
    });
    
    await Promise.all(updatePromises);
    return expiredEnrollments.length;
  }

  /**
   * Issue a certificate for a completed enrollment
   * @param enrollmentId - ID of the enrollment
   * @param certificateUrl - URL to the generated certificate
   * @returns Promise resolving when the update completes
   */
  async issueCertificate(enrollmentId: string, certificateUrl: string): Promise<void> {
    const enrollment = await this.findById(enrollmentId);
    
    if (enrollment && enrollment.status === EnrollmentStatus.COMPLETED) {
      enrollment.issueCertificate(certificateUrl);
      await enrollment.save();
    }
  }
}

export default EnrollmentRepository;