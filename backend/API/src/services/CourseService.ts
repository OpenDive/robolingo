import { Transaction } from 'sequelize';
import sequelize from '../config/database';
import BaseService from './BaseService';
import { Course } from '../models';
import { ProficiencyLevel } from '../models/Course';
import CourseRepository from '../repositories/CourseRepository';
import LectureRepository from '../repositories/LectureRepository';
import { LectureType } from '../models/Lecture';

/**
 * Service for course-related operations
 */
class CourseService extends BaseService<Course, CourseRepository> {
  private lectureRepository: LectureRepository;

  /**
   * Create service with required repositories
   * @param courseRepository - Repository for course operations
   * @param lectureRepository - Repository for lecture operations
   */
  constructor(courseRepository: CourseRepository, lectureRepository: LectureRepository) {
    super(courseRepository);
    this.lectureRepository = lectureRepository;
  }

  /**
   * Get published courses with filtering options
   * @param filters - Optional filter parameters
   * @returns Promise resolving to filtered courses
   */
  async getPublishedCourses(filters?: {
    language?: string;
    targetLanguage?: string;
    level?: ProficiencyLevel;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
  }): Promise<Course[]> {
    return this.repository.findPublishedCourses(filters);
  }

  /**
   * Get courses created by a specific instructor
   * @param instructorId - ID of the instructor
   * @param includeUnpublished - Whether to include unpublished courses
   * @returns Promise resolving to instructor's courses
   */
  async getCoursesByInstructor(instructorId: string, includeUnpublished = false): Promise<Course[]> {
    return this.repository.findByInstructor(instructorId, includeUnpublished);
  }

  /**
   * Get featured or popular courses
   * @param limit - Maximum number of courses to return
   * @returns Promise resolving to featured courses
   */
  async getFeaturedCourses(limit = 6): Promise<Course[]> {
    return this.repository.findFeaturedCourses(limit);
  }

  /**
   * Get course details with lectures
   * @param courseId - ID of the course
   * @returns Promise resolving to course with lectures or null if not found
   */
  async getCourseWithLectures(courseId: string): Promise<Course | null> {
    return this.repository.getWithLectures(courseId);
  }

  /**
   * Create a new course
   * @param courseData - Course data
   * @returns Promise resolving to created course
   */
  async createCourse(courseData: {
    title: string;
    description: string;
    language: string;
    targetLanguage: string;
    level: ProficiencyLevel;
    price: number;
    duration: number;
    thumbnailUrl?: string;
    instructorId: string;
  }): Promise<Course> {
    return this.repository.create(courseData);
  }

  /**
   * Update an existing course
   * @param courseId - ID of the course to update
   * @param courseData - Updated course data
   * @returns Promise resolving to updated course or null if not found
   */
  async updateCourse(courseId: string, courseData: Partial<{
    title: string;
    description: string;
    language: string;
    targetLanguage: string;
    level: ProficiencyLevel;
    price: number;
    duration: number;
    thumbnailUrl: string;
  }>): Promise<Course | null> {
    return this.update(courseId, courseData);
  }

  /**
   * Create a new course with initial lectures
   * @param courseData - Course data
   * @param lectures - Array of lecture data
   * @returns Promise resolving to created course with lectures
   */
  async createCourseWithLectures(
    courseData: {
      title: string;
      description: string;
      language: string;
      targetLanguage: string;
      level: ProficiencyLevel;
      price: number;
      duration: number;
      thumbnailUrl?: string;
      instructorId: string;
    },
    lectures: Array<{
      title: string;
      description: string;
      type: LectureType;
      content: string;
      duration: number;
      isPreview?: boolean;
    }>
  ): Promise<Course> {
    // Use transaction to ensure atomicity
    const transaction = await sequelize.transaction();

    try {
      // Create course
      const course = await this.repository.create(courseData, { transaction });

      // Create lectures with order
      if (lectures.length > 0) {
        const lecturePromises = lectures.map((lectureData, index) => {
          return this.lectureRepository.create({
            ...lectureData,
            courseId: course.id,
            order: index,
            isPublished: false
          }, { transaction });
        });

        await Promise.all(lecturePromises);
      }

      // Commit transaction
      await transaction.commit();

      // Return course with lectures
      return this.repository.getWithLectures(course.id) as Promise<Course>;
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Publish a course (make it available to students)
   * @param courseId - ID of the course
   * @returns Promise resolving to boolean indicating success
   */
  async publishCourse(courseId: string): Promise<boolean> {
    try {
      await this.repository.publishCourse(courseId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Unpublish a course (hide from students)
   * @param courseId - ID of the course
   * @returns Promise resolving to boolean indicating success
   */
  async unpublishCourse(courseId: string): Promise<boolean> {
    try {
      await this.repository.unpublishCourse(courseId);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete a course and its associated content
   * @param courseId - ID of the course
   * @returns Promise resolving to boolean indicating success
   */
  async deleteCourse(courseId: string): Promise<boolean> {
    const transaction = await sequelize.transaction();

    try {
      // Check if course exists
      const course = await this.repository.findById(courseId);
      if (!course) {
        await transaction.rollback();
        return false;
      }

      // Delete course (cascading deletion handled by database constraints)
      await this.repository.delete(courseId, { transaction });

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
   * Get similar courses based on language and level
   * @param courseId - Reference course ID
   * @param limit - Maximum number of similar courses to return
   * @returns Promise resolving to array of similar courses
   */
  async getSimilarCourses(courseId: string, limit = 4): Promise<Course[]> {
    return this.repository.findSimilarCourses(courseId, limit);
  }

  /**
   * Update course rating when a new review is added
   * @param courseId - ID of the course
   * @param newRating - New rating value
   * @returns Promise resolving to boolean indicating success
   */
  async updateCourseRating(courseId: string, newRating: number): Promise<boolean> {
    try {
      await this.repository.updateRating(courseId, newRating);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default CourseService;