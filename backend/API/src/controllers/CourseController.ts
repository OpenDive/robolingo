import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { CourseService } from '../services';
import { ProficiencyLevel } from '../models/Course';
import { UserRole } from '../models/User';

/**
 * Controller for course-related API endpoints
 * Handles course discovery, creation, and management
 */
class CourseController extends BaseController<any> {
  private courseService: CourseService;

  /**
   * Creates a controller with the CourseService
   * @param courseService - Service for course operations
   */
  constructor(courseService: CourseService) {
    super(courseService);
    this.courseService = courseService;
  }

  /**
   * Get published courses with filtering
   * @param req - Express request with optional filter parameters
   * @param res - Express response object
   * @param next - Express next function
   */
  getPublishedCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        language,
        targetLanguage,
        level,
        minPrice,
        maxPrice,
        search
      } = req.query;
      
      const filters: any = {};
      
      if (language) filters.language = language as string;
      if (targetLanguage) filters.targetLanguage = targetLanguage as string;
      if (level && Object.values(ProficiencyLevel).includes(level as ProficiencyLevel)) {
        filters.level = level as ProficiencyLevel;
      }
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (search) filters.search = search as string;
      
      const courses = await this.courseService.getPublishedCourses(filters);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get featured or popular courses
   * @param req - Express request with optional limit parameter
   * @param res - Express response object
   * @param next - Express next function
   */
  getFeaturedCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const courses = await this.courseService.getFeaturedCourses(limit);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get courses created by the authenticated instructor
   * @param req - Express request with authenticated user
   * @param res - Express response object
   * @param next - Express next function
   */
  getInstructorCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructorId = req.user?.id;
      
      if (!instructorId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      // Check if user is an instructor
      if (req.user?.role !== UserRole.INSTRUCTOR && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const includeUnpublished = true; // Instructors see all their courses
      const courses = await this.courseService.getCoursesByInstructor(instructorId, includeUnpublished);
      res.json(courses);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get course details with lectures
   * @param req - Express request with course ID parameter
   * @param res - Express response object
   * @param next - Express next function
   */
  getCourseWithLectures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseId = req.params.id;
      const course = await this.courseService.getCourseWithLectures(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if course is published or user is the instructor/admin
      const isInstructor = req.user?.id === course.instructorId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!course.isPublished && !isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Course is not published' });
        return;
      }
      
      res.json(course);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new course (instructor only)
   * @param req - Express request with course data
   * @param res - Express response object
   * @param next - Express next function
   */
  createCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructorId = req.user?.id;
      
      if (!instructorId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      // Check if user is an instructor
      if (req.user?.role !== UserRole.INSTRUCTOR && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const {
        title,
        description,
        language,
        targetLanguage,
        level,
        price,
        duration,
        thumbnailUrl
      } = req.body;
      
      const course = await this.courseService.createCourse({
        title,
        description,
        language,
        targetLanguage,
        level,
        price,
        duration,
        thumbnailUrl,
        instructorId
      });
      
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a course with initial lectures (instructor only)
   * @param req - Express request with course and lecture data
   * @param res - Express response object
   * @param next - Express next function
   */
  createCourseWithLectures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const instructorId = req.user?.id;
      
      if (!instructorId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      // Check if user is an instructor
      if (req.user?.role !== UserRole.INSTRUCTOR && req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const { course: courseData, lectures } = req.body;
      
      if (!courseData || !lectures || !Array.isArray(lectures)) {
        res.status(400).json({ message: 'Invalid request format' });
        return;
      }
      
      const course = await this.courseService.createCourseWithLectures(
        {
          ...courseData,
          instructorId
        },
        lectures
      );
      
      res.status(201).json(course);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing course (instructor only)
   * @param req - Express request with course ID and update data
   * @param res - Express response object
   * @param next - Express next function
   */
  updateCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.id;
      
      // Get the course to check ownership
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or an admin
      const isInstructor = userId === course.instructorId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const {
        title,
        description,
        language,
        targetLanguage,
        level,
        price,
        duration,
        thumbnailUrl
      } = req.body;
      
      const updatedCourse = await this.courseService.updateCourse(courseId, {
        title,
        description,
        language,
        targetLanguage,
        level,
        price,
        duration,
        thumbnailUrl
      });
      
      res.json(updatedCourse);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Publish a course (instructor only)
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  publishCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.id;
      
      // Get the course to check ownership
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or an admin
      const isInstructor = userId === course.instructorId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.courseService.publishCourse(courseId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to publish course' });
        return;
      }
      
      res.json({ message: 'Course published successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unpublish a course (instructor only)
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  unpublishCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.id;
      
      // Get the course to check ownership
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or an admin
      const isInstructor = userId === course.instructorId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.courseService.unpublishCourse(courseId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to unpublish course' });
        return;
      }
      
      res.json({ message: 'Course unpublished successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a course (instructor only)
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  deleteCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.id;
      
      // Get the course to check ownership
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or an admin
      const isInstructor = userId === course.instructorId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.courseService.deleteCourse(courseId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to delete course' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get similar courses based on language and level
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getSimilarCourses = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseId = req.params.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      
      const similarCourses = await this.courseService.getSimilarCourses(courseId, limit);
      res.json(similarCourses);
    } catch (error) {
      next(error);
    }
  };
}

export default CourseController;