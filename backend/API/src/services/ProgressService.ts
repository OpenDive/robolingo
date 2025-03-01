import sequelize from '../config/database';
import BaseService from './BaseService';
import Progress from '../models/Progress.model';
import ProgressRepository from '../repositories/ProgressRepository';
import EnrollmentRepository from '../repositories/EnrollmentRepository';
import LectureRepository from '../repositories/LectureRepository';

/**
 * Service for user progress tracking within lectures
 */
class ProgressService extends BaseService<Progress, ProgressRepository> {
  private enrollmentRepository: EnrollmentRepository;
  private lectureRepository: LectureRepository;

  /**
   * Create service with required repositories
   * @param progressRepository - Repository for progress operations
   * @param enrollmentRepository - Repository for enrollment operations
   * @param lectureRepository - Repository for lecture operations
   */
  constructor(
    progressRepository: ProgressRepository,
    enrollmentRepository: EnrollmentRepository,
    lectureRepository: LectureRepository
  ) {
    super(progressRepository);
    this.enrollmentRepository = enrollmentRepository;
    this.lectureRepository = lectureRepository;
  }

  /**
   * Get user progress for a specific course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to array of progress entries
   */
  async getUserCourseProgress(userId: string, courseId: string): Promise<Progress[]> {
    return this.repository.findByUserAndCourse(userId, courseId);
  }

  /**
   * Get user progress for a specific lecture
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to progress or null if not found
   */
  async getUserLectureProgress(userId: string, lectureId: string): Promise<Progress | null> {
    return this.repository.findByUserAndLecture(userId, lectureId);
  }

  /**
   * Track user progress in a lecture
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @param progressData - Progress data to update
   * @returns Promise resolving to updated progress
   * @throws Error if user is not enrolled in the course
   */
  async trackLectureProgress(
    userId: string,
    lectureId: string,
    progressData: {
      progress: number;
      lastPosition?: number;
      notes?: string;
    }
  ): Promise<Progress> {
    const transaction = await sequelize.transaction();
    
    try {
      // Get lecture to find course
      const lecture = await this.lectureRepository.findById(lectureId);
      if (!lecture) {
        await transaction.rollback();
        throw new Error('Lecture not found');
      }
      
      // Check if user is enrolled in the course
      const courseId = lecture.courseId;
      const isEnrolled = await this.enrollmentRepository.isUserEnrolled(userId, courseId);
      
      if (!isEnrolled) {
        await transaction.rollback();
        throw new Error('User is not enrolled in this course');
      }
      
      // Find enrollment to associate with progress
      const enrollment = await this.enrollmentRepository.findOne({
        where: {
          userId,
          courseId
        }
      });
      
      if (!enrollment) {
        await transaction.rollback();
        throw new Error('Enrollment not found');
      }
      
      // Create or update progress
      const progress = await this.repository.createOrUpdateProgress(
        userId,
        lectureId,
        enrollment.id,
        progressData
      );
      
      // Update overall course progress
      const overallProgress = await this.repository.calculateCourseProgress(userId, courseId);
      await this.enrollmentRepository.updateProgress(userId, courseId, overallProgress);
      
      // Auto-complete course if progress is 100%
      if (overallProgress === 100) {
        await this.enrollmentRepository.markAsCompleted(userId, courseId);
      }
      
      // Commit transaction
      await transaction.commit();
      return progress;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Mark a lecture as completed for a user
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to boolean indicating success
   */
  async markLectureAsCompleted(userId: string, lectureId: string): Promise<boolean> {
    const transaction = await sequelize.transaction();
    
    try {
      // Get lecture to find course
      const lecture = await this.lectureRepository.findById(lectureId);
      if (!lecture) {
        await transaction.rollback();
        return false;
      }
      
      const courseId = lecture.courseId;
      
      // Mark lecture as completed
      await this.repository.markAsCompleted(userId, lectureId);
      
      // Update overall course progress
      const overallProgress = await this.repository.calculateCourseProgress(userId, courseId);
      await this.enrollmentRepository.updateProgress(userId, courseId, overallProgress);
      
      // Auto-complete course if progress is 100%
      if (overallProgress === 100) {
        await this.enrollmentRepository.markAsCompleted(userId, courseId);
      }
      
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
   * Save user notes for a lecture
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @param notes - Notes content
   * @returns Promise resolving to boolean indicating success
   */
  async saveNotes(userId: string, lectureId: string, notes: string): Promise<boolean> {
    try {
      await this.repository.saveNotes(userId, lectureId, notes);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the next unfinished lecture for a user in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to the next lecture ID or null if course completed
   */
  async getNextUnfinishedLecture(userId: string, courseId: string): Promise<string | null> {
    // Get all progress entries for this course
    const progressEntries = await this.repository.findByUserAndCourse(userId, courseId);
    
    // Get all lectures for this course
    const lectures = await this.lectureRepository.findByCourse(courseId, false);
    
    // Create a map of completed lectures
    const completedLectures = new Map<string, boolean>();
    progressEntries.forEach(entry => {
      if (entry.isCompleted) {
        completedLectures.set(entry.lectureId, true);
      }
    });
    
    // Find the first unfinished lecture
    for (const lecture of lectures) {
      if (!completedLectures.has(lecture.id)) {
        return lecture.id;
      }
    }
    
    // All lectures completed
    return null;
  }

  /**
   * Get overall course progress percentage
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to progress percentage
   */
  async getOverallCourseProgress(userId: string, courseId: string): Promise<number> {
    return this.repository.calculateCourseProgress(userId, courseId);
  }
}

export default ProgressService;