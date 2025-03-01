import { Op, WhereOptions } from 'sequelize';
import BaseRepository from './BaseRepository';
import { ProficiencyLevel } from '../models/Course.model';
import Course from '../models/Course.model';
import User from '../models/User.model';
import Lecture from '../models/Lecture.model';

/**
 * Repository for Course-specific data operations
 * Extends BaseRepository with additional course-focused methods
 */
class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super(Course);
  }

  /**
   * Find published courses with basic filtering
   * @param options - Optional filtering parameters
   * @returns Promise resolving to array of matching courses
   */
  async findPublishedCourses(options?: {
    language?: string;
    targetLanguage?: string;
    level?: ProficiencyLevel;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Course[]> {
    const whereClause: WhereOptions = {
      isPublished: true
    };

    // Apply optional filters
    if (options) {
      if (options.language) {
        whereClause.language = options.language;
      }
      
      if (options.targetLanguage) {
        whereClause.targetLanguage = options.targetLanguage;
      }
      
      if (options.level) {
        whereClause.level = options.level;
      }
      
      // Price range filter
      if (options.minPrice !== undefined || options.maxPrice !== undefined) {
        whereClause.price = {};
        
        if (options.minPrice !== undefined) {
          whereClause.price[Op.gte] = options.minPrice;
        }
        
        if (options.maxPrice !== undefined) {
          whereClause.price[Op.lte] = options.maxPrice;
        }
      }
      
      // Text search in title and description
      if (options.search) {
        whereClause[Op.or as any] = [
          { title: { [Op.iLike]: `%${options.search}%` } },
          { description: { [Op.iLike]: `%${options.search}%` } }
        ];
      }
    }

    return this.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'profileImage']
        }
      ],
      order: [['publishedAt', 'DESC']]
    });
  }

  /**
   * Find courses created by a specific instructor
   * @param instructorId - ID of the instructor
   * @param includeUnpublished - Whether to include unpublished courses
   * @returns Promise resolving to array of instructor's courses
   */
  async findByInstructor(instructorId: string, includeUnpublished = false): Promise<Course[]> {
    const whereClause: WhereOptions = {
      instructorId
    };
    
    if (!includeUnpublished) {
      whereClause.isPublished = true;
    }

    return this.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Find featured or popular courses
   * @param limit - Maximum number of courses to return
   * @returns Promise resolving to array of featured courses
   */
  async findFeaturedCourses(limit = 6): Promise<Course[]> {
    return this.findAll({
      where: {
        isPublished: true
      },
      order: [
        ['enrollmentCount', 'DESC'],
        ['averageRating', 'DESC']
      ],
      limit,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
  }

  /**
   * Find similar courses based on language and level
   * @param courseId - Reference course ID to find similar courses
   * @param limit - Maximum number of similar courses to return
   * @returns Promise resolving to array of similar courses
   */
  async findSimilarCourses(courseId: string, limit = 4): Promise<Course[]> {
    // First get the reference course
    const referenceCourse = await this.findById(courseId);
    
    if (!referenceCourse) {
      return [];
    }

    // Find courses with same target language and similar level
    return this.findAll({
      where: {
        id: { [Op.ne]: courseId },
        isPublished: true,
        targetLanguage: referenceCourse.targetLanguage,
        level: referenceCourse.level
      },
      limit,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
  }

  /**
   * Find courses available in specific languages
   * @param languages - Array of language codes
   * @returns Promise resolving to array of matching courses
   */
  async findByLanguages(languages: string[]): Promise<Course[]> {
    return this.findAll({
      where: {
        isPublished: true,
        targetLanguage: {
          [Op.in]: languages
        }
      },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
  }

  /**
   * Get a course with all its lectures
   * @param courseId - ID of the course
   * @returns Promise resolving to course with lectures
   */
  async getWithLectures(courseId: string): Promise<Course | null> {
    return this.findById(courseId, {
      include: [
        {
          model: Lecture,
          as: 'lectures',
          order: [['order', 'ASC']]
        },
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'firstName', 'lastName', 'bio', 'profileImage']
        }
      ]
    });
  }

  /**
   * Update course ratings when a new review is added
   * @param courseId - ID of the course
   * @param newRating - New rating value
   * @returns Promise resolving when the update completes
   */
  async updateRating(courseId: string, newRating: number): Promise<void> {
    const course = await this.findById(courseId);
    
    if (course) {
      course.updateRating(newRating);
      await course.save();
    }
  }

  /**
   * Increment enrollment count for a course
   * @param courseId - ID of the course
   * @returns Promise resolving when update completes
   */
  async incrementEnrollment(courseId: string): Promise<void> {
    const course = await this.findById(courseId);
    
    if (course) {
      course.incrementEnrollment();
      await course.save();
    }
  }

  /**
   * Publish a course
   * @param courseId - ID of the course
   * @returns Promise resolving when the course is published
   */
  async publishCourse(courseId: string): Promise<void> {
    const course = await this.findById(courseId);
    
    if (course) {
      course.publish();
      await course.save();
    }
  }

  /**
   * Unpublish a course
   * @param courseId - ID of the course
   * @returns Promise resolving when the course is unpublished
   */
  async unpublishCourse(courseId: string): Promise<void> {
    const course = await this.findById(courseId);
    
    if (course) {
      course.unpublish();
      await course.save();
    }
  }
}

export default CourseRepository;