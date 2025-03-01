import BaseRepository from './BaseRepository';
import Progress from '../models/Progress.model';
import Lecture from '../models/Lecture.model';

/**
 * Repository for Progress-specific data operations
 * Handles tracking user progress in individual lectures
 */
class ProgressRepository extends BaseRepository<Progress> {
  constructor() {
    super(Progress);
  }

  /**
   * Find progress entries for a specific user and course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to array of progress entries
   */
  async findByUserAndCourse(userId: string, courseId: string): Promise<Progress[]> {
    return this.findAll({
      where: { userId },
      include: [
        {
          model: Lecture,
          as: 'lecture',
          where: { courseId },
          attributes: ['id', 'title', 'order', 'duration']
        }
      ],
      order: [[{ model: Lecture, as: 'lecture' }, 'order', 'ASC']]
    });
  }

  /**
   * Get user progress for a specific lecture
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to progress or null if not found
   */
  async findByUserAndLecture(userId: string, lectureId: string): Promise<Progress | null> {
    return this.findOne({
      where: { userId, lectureId }
    });
  }

  /**
   * Create or update user progress for a lecture
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @param enrollmentId - ID of the enrollment
   * @param progressData - Progress data to update
   * @returns Promise resolving to the updated progress
   */
  async createOrUpdateProgress(
    userId: string,
    lectureId: string,
    enrollmentId: string,
    progressData: {
      progress: number;
      lastPosition?: number;
      notes?: string;
    }
  ): Promise<Progress> {
    // Try to find existing progress
    let progress = await this.findByUserAndLecture(userId, lectureId);
    
    if (progress) {
      // Update existing progress
      progress.updateProgress(progressData.progress, progressData.lastPosition);
      
      if (progressData.notes !== undefined) {
        progress.saveNotes(progressData.notes);
      }
      
      await progress.save();
    } else {
      // Create new progress entry
      progress = await this.create({
        userId,
        lectureId,
        enrollmentId,
        progress: progressData.progress,
        lastPosition: progressData.lastPosition,
        notes: progressData.notes,
        isCompleted: progressData.progress >= 100
      });
    }
    
    return progress;
  }

  /**
   * Mark a lecture as completed for a user
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @returns Promise resolving when the update completes
   */
  async markAsCompleted(userId: string, lectureId: string): Promise<void> {
    const progress = await this.findByUserAndLecture(userId, lectureId);
    
    if (progress) {
      progress.markAsCompleted();
      await progress.save();
    }
  }

  /**
   * Calculate overall progress percentage for a user in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving to overall progress percentage
   */
  async calculateCourseProgress(userId: string, courseId: string): Promise<number> {
    // Get all lectures for the course
    const lectures = await Lecture.findAll({
      where: { courseId, isPublished: true },
      attributes: ['id']
    });
    
    if (lectures.length === 0) {
      return 0;
    }
    
    // Get progress for all lectures
    const progressEntries = await this.findAll({
      where: {
        userId,
        lectureId: lectures.map(lecture => lecture.id)
      }
    });
    
    // Calculate overall progress
    const totalProgress = progressEntries.reduce((sum, entry) => sum + entry.progress, 0);
    const overallProgress = Math.floor(totalProgress / lectures.length);
    
    return Math.min(overallProgress, 100);
  }

  /**
   * Save user notes for a lecture
   * @param userId - ID of the user
   * @param lectureId - ID of the lecture
   * @param notes - Notes content
   * @returns Promise resolving when the update completes
   */
  async saveNotes(userId: string, lectureId: string, notes: string): Promise<void> {
    const progress = await this.findByUserAndLecture(userId, lectureId);
    
    if (progress) {
      progress.saveNotes(notes);
      await progress.save();
    }
  }

  /**
   * Reset progress for a user in a course
   * @param userId - ID of the user
   * @param courseId - ID of the course
   * @returns Promise resolving when all updates complete
   */
  async resetCourseProgress(userId: string, courseId: string): Promise<void> {
    const progressEntries = await this.findByUserAndCourse(userId, courseId);
    
    const resetPromises = progressEntries.map(progress => {
      progress.resetProgress();
      return progress.save();
    });
    
    await Promise.all(resetPromises);
  }
}

export default ProgressRepository;