import sequelize from '../config/database';
import BaseService from './BaseService';
import { LectureType } from '../models/Lecture.model';
import Lecture from '../models/Lecture.model';
import LectureRepository from '../repositories/LectureRepository';
import QuizRepository from '../repositories/QuizRepository';

/**
 * Service for lecture-related operations
 */
class LectureService extends BaseService<Lecture, LectureRepository> {
  private quizRepository: QuizRepository;

  /**
   * Create service with required repositories
   * @param lectureRepository - Repository for lecture operations
   * @param quizRepository - Repository for quiz operations
   */
  constructor(lectureRepository: LectureRepository, quizRepository: QuizRepository) {
    super(lectureRepository);
    this.quizRepository = quizRepository;
  }

  /**
   * Get all lectures for a course
   * @param courseId - ID of the course
   * @param includeUnpublished - Whether to include unpublished lectures
   * @returns Promise resolving to array of lectures
   */
  async getLecturesByCourse(courseId: string, includeUnpublished = false): Promise<Lecture[]> {
    return this.repository.findByCourse(courseId, includeUnpublished);
  }

  /**
   * Get lecture details with its quiz
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to lecture with quiz or null if not found
   */
  async getLectureWithQuiz(lectureId: string): Promise<Lecture | null> {
    return this.repository.getWithQuiz(lectureId);
  }

  /**
   * Create a new lecture for a course
   * @param lectureData - Lecture data
   * @returns Promise resolving to created lecture
   */
  async createLecture(lectureData: {
    title: string;
    description: string;
    courseId: string;
    type: LectureType;
    content: string;
    duration: number;
    order?: number;
    isPreview?: boolean;
  }): Promise<Lecture> {
    // Determine lecture order if not provided
    if (lectureData.order === undefined) {
      const existingLectures = await this.repository.findByCourse(lectureData.courseId, true);
      lectureData.order = existingLectures.length;
    }

    return this.repository.create(lectureData);
  }

  /**
   * Update an existing lecture
   * @param lectureId - ID of the lecture
   * @param lectureData - Updated lecture data
   * @returns Promise resolving to updated lecture or null if not found
   */
  async updateLecture(lectureId: string, lectureData: Partial<{
    title: string;
    description: string;
    type: LectureType;
    content: string;
    duration: number;
    isPreview: boolean;
  }>): Promise<Lecture | null> {
    return this.update(lectureId, lectureData);
  }

  /**
   * Delete a lecture and its associated content
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to boolean indicating success
   */
  async deleteLecture(lectureId: string): Promise<boolean> {
    const transaction = await sequelize.transaction();

    try {
      // Check if lecture exists
      const lecture = await this.repository.findById(lectureId);
      if (!lecture) {
        await transaction.rollback();
        return false;
      }

      // Get course ID for reordering
      const courseId = lecture.courseId;

      // Delete lecture (cascading deletion handled by database constraints)
      await this.repository.delete(lectureId, { transaction });

      // Get remaining lectures to reorder
      const remainingLectures = await this.repository.findByCourse(courseId, true);
      const lectureOrder = remainingLectures.map(l => l.id);

      // Reorder remaining lectures
      if (lectureOrder.length > 0) {
        await this.repository.reorderLectures(courseId, lectureOrder, transaction);
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
   * Reorder lectures within a course
   * @param courseId - ID of the course
   * @param lectureOrder - Array of lecture IDs in desired order
   * @returns Promise resolving to boolean indicating success
   */
  async reorderLectures(courseId: string, lectureOrder: string[]): Promise<boolean> {
    try {
      await this.repository.reorderLectures(courseId, lectureOrder);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Publish a lecture (make it available to students)
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to boolean indicating success
   */
  async publishLecture(lectureId: string): Promise<boolean> {
    try {
      await this.repository.publishLecture(lectureId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Unpublish a lecture (hide from students)
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to boolean indicating success
   */
  async unpublishLecture(lectureId: string): Promise<boolean> {
    try {
      await this.repository.unpublishLecture(lectureId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Set a lecture as a preview (viewable without enrollment)
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to boolean indicating success
   */
  async setLectureAsPreview(lectureId: string): Promise<boolean> {
    try {
      await this.repository.setAsPreview(lectureId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Remove a lecture from preview status
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to boolean indicating success
   */
  async removeLectureFromPreview(lectureId: string): Promise<boolean> {
    try {
      await this.repository.removeFromPreview(lectureId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the next lecture in sequence
   * @param lectureId - Current lecture ID
   * @returns Promise resolving to the next lecture or null
   */
  async getNextLecture(lectureId: string): Promise<Lecture | null> {
    return this.repository.getNextLecture(lectureId);
  }

  /**
   * Get the previous lecture in sequence
   * @param lectureId - Current lecture ID
   * @returns Promise resolving to the previous lecture or null
   */
  async getPreviousLecture(lectureId: string): Promise<Lecture | null> {
    return this.repository.getPreviousLecture(lectureId);
  }
}

export default LectureService;