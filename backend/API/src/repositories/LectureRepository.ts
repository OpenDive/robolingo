import { Transaction } from 'sequelize';
import BaseRepository from './BaseRepository';
import Lecture from '../models/Lecture.model';
import Quiz from '../models/Quiz.model';

/**
 * Repository for Lecture-specific data operations
 * Extends BaseRepository with additional lecture-focused methods
 */
class LectureRepository extends BaseRepository<Lecture> {
  constructor() {
    super(Lecture);
  }

  /**
   * Find all lectures for a specific course
   * @param courseId - ID of the course
   * @param includeUnpublished - Whether to include unpublished lectures
   * @returns Promise resolving to array of lectures
   */
  async findByCourse(courseId: string, includeUnpublished = false): Promise<Lecture[]> {
    const whereClause: any = {
      courseId
    };
    
    if (!includeUnpublished) {
      whereClause.isPublished = true;
    }

    return this.findAll({
      where: whereClause,
      order: [['order', 'ASC']]
    });
  }

  /**
   * Find preview lectures for a course
   * @param courseId - ID of the course
   * @returns Promise resolving to array of preview lectures
   */
  async findPreviewLectures(courseId: string): Promise<Lecture[]> {
    return this.findAll({
      where: {
        courseId,
        isPublished: true,
        isPreview: true
      },
      order: [['order', 'ASC']]
    });
  }

  /**
   * Get a lecture with its associated quiz
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to lecture with quiz
   */
  async getWithQuiz(lectureId: string): Promise<Lecture | null> {
    return this.findById(lectureId, {
      include: [
        {
          model: Quiz,
          as: 'quiz'
        }
      ]
    });
  }

  /**
   * Reorder lectures within a course
   * @param courseId - ID of the course
   * @param lectureOrder - Array of lecture IDs in the desired order
   * @param transaction - Optional transaction for batch updates
   * @returns Promise resolving when all updates complete
   */
  async reorderLectures(
    courseId: string, 
    lectureOrder: string[], 
    transaction?: Transaction
  ): Promise<void> {
    const lectures = await this.findByCourse(courseId, true);
    
    // Map lectures by ID for easy lookup
    const lectureMap = new Map<string, Lecture>();
    lectures.forEach(lecture => lectureMap.set(lecture.id, lecture));
    
    // Update order for each lecture
    const updatePromises = lectureOrder.map((lectureId, index) => {
      const lecture = lectureMap.get(lectureId);
      
      if (lecture && lecture.order !== index) {
        lecture.order = index;
        return lecture.save({ transaction });
      }
      
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
  }

  /**
   * Publish a lecture
   * @param lectureId - ID of the lecture
   * @returns Promise resolving when the lecture is published
   */
  async publishLecture(lectureId: string): Promise<void> {
    const lecture = await this.findById(lectureId);
    
    if (lecture) {
      lecture.publish();
      await lecture.save();
    }
  }

  /**
   * Unpublish a lecture
   * @param lectureId - ID of the lecture
   * @returns Promise resolving when the lecture is unpublished
   */
  async unpublishLecture(lectureId: string): Promise<void> {
    const lecture = await this.findById(lectureId);
    
    if (lecture) {
      lecture.unpublish();
      await lecture.save();
    }
  }

  /**
   * Set a lecture as a preview
   * @param lectureId - ID of the lecture
   * @returns Promise resolving when the update completes
   */
  async setAsPreview(lectureId: string): Promise<void> {
    const lecture = await this.findById(lectureId);
    
    if (lecture) {
      lecture.setAsPreview();
      await lecture.save();
    }
  }

  /**
   * Remove a lecture from preview status
   * @param lectureId - ID of the lecture
   * @returns Promise resolving when the update completes
   */
  async removeFromPreview(lectureId: string): Promise<void> {
    const lecture = await this.findById(lectureId);
    
    if (lecture) {
      lecture.removeFromPreview();
      await lecture.save();
    }
  }

  /**
   * Get the next lecture in sequence
   * @param lectureId - Current lecture ID
   * @returns Promise resolving to the next lecture or null
   */
  async getNextLecture(lectureId: string): Promise<Lecture | null> {
    const currentLecture = await this.findById(lectureId);
    
    if (!currentLecture) {
      return null;
    }
    
    return this.findOne({
      where: {
        courseId: currentLecture.courseId,
        order: currentLecture.order + 1,
        isPublished: true
      }
    });
  }

  /**
   * Get the previous lecture in sequence
   * @param lectureId - Current lecture ID
   * @returns Promise resolving to the previous lecture or null
   */
  async getPreviousLecture(lectureId: string): Promise<Lecture | null> {
    const currentLecture = await this.findById(lectureId);
    
    if (!currentLecture || currentLecture.order === 0) {
      return null;
    }
    
    return this.findOne({
      where: {
        courseId: currentLecture.courseId,
        order: currentLecture.order - 1,
        isPublished: true
      }
    });
  }
}

export default LectureRepository;