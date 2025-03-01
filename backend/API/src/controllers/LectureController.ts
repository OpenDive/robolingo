import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { LectureService, CourseService, EnrollmentService } from '../services';
import { UserRole } from '../models/User.model';

/**
 * Controller for lecture-related API endpoints
 * Handles lecture management and delivery
 */
class LectureController extends BaseController<any> {
  private lectureService: LectureService;
  private courseService: CourseService;
  private enrollmentService: EnrollmentService;

  /**
   * Creates a controller with the required services
   * @param lectureService - Service for lecture operations
   * @param courseService - Service for course operations
   * @param enrollmentService - Service for enrollment operations
   */
  constructor(
    lectureService: LectureService,
    courseService: CourseService,
    enrollmentService: EnrollmentService
  ) {
    super(lectureService);
    this.lectureService = lectureService;
    this.courseService = courseService;
    this.enrollmentService = enrollmentService;
  }

  /**
   * Get all lectures for a course
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getLecturesByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseId = req.params.courseId;
      const userId = req.user?.id;
      
      // Get the course to check its published status
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Determine if we should include unpublished lectures
      let includeUnpublished = false;
      
      if (userId) {
        // Include unpublished if user is instructor or admin
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        includeUnpublished = isInstructor || isAdmin;
      }
      
      const lectures = await this.lectureService.getLecturesByCourse(courseId, includeUnpublished);
      res.json(lectures);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get lecture details with its quiz
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getLectureWithQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lectureId = req.params.id;
      const userId = req.user?.id;
      
      const lecture = await this.lectureService.getLectureWithQuiz(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Get course to check access permissions
      const course = await this.courseService.findById(lecture.courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check access permissions
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      const isPreview = lecture.isPreview;
      
      // If it's not a preview lecture, check if user is enrolled
      if (!isPreview && !isInstructor && !isAdmin) {
        if (!userId) {
          res.status(401).json({ message: 'Authentication required' });
          return;
        }
        
        const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, course.id);
        
        if (!isEnrolled) {
          res.status(403).json({ message: 'Enrollment required to access this lecture' });
          return;
        }
      }
      
      res.json(lecture);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new lecture for a course (instructor only)
   * @param req - Express request with lecture data
   * @param res - Express response object
   * @param next - Express next function
   */
  createLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const { courseId, title, description, type, content, duration, isPreview } = req.body;
      
      // Get course to check ownership
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const lecture = await this.lectureService.createLecture({
        courseId,
        title,
        description,
        type,
        content,
        duration,
        isPreview
      });
      
      res.status(201).json(lecture);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing lecture (instructor only)
   * @param req - Express request with lecture ID and update data
   * @param res - Express response object
   * @param next - Express next function
   */
  updateLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.id;
      
      // Get the lecture and its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Get course to check ownership
      const course = await this.courseService.findById(lecture.courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const { title, description, type, content, duration, isPreview } = req.body;
      
      const updatedLecture = await this.lectureService.updateLecture(lectureId, {
        title,
        description,
        type,
        content,
        duration,
        isPreview
      });
      
      res.json(updatedLecture);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a lecture (instructor only)
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  deleteLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.id;
      
      // Get the lecture and its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Get course to check ownership
      const course = await this.courseService.findById(lecture.courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.lectureService.deleteLecture(lectureId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to delete lecture' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reorder lectures within a course (instructor only)
   * @param req - Express request with course ID and lecture order
   * @param res - Express response object
   * @param next - Express next function
   */
  reorderLectures = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.courseId;
      const { lectureOrder } = req.body;
      
      if (!Array.isArray(lectureOrder)) {
        res.status(400).json({ message: 'lectureOrder must be an array of lecture IDs' });
        return;
      }
      
      // Get course to check ownership
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.lectureService.reorderLectures(courseId, lectureOrder);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to reorder lectures' });
        return;
      }
      
      res.json({ message: 'Lectures reordered successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Publish a lecture (instructor only)
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  publishLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.id;
      
      // Get the lecture and its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Get course to check ownership
      const course = await this.courseService.findById(lecture.courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.lectureService.publishLecture(lectureId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to publish lecture' });
        return;
      }
      
      res.json({ message: 'Lecture published successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Unpublish a lecture (instructor only)
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  unpublishLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.id;
      
      // Get the lecture and its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Get course to check ownership
      const course = await this.courseService.findById(lecture.courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.lectureService.unpublishLecture(lectureId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to unpublish lecture' });
        return;
      }
      
      res.json({ message: 'Lecture unpublished successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Set a lecture as a preview (instructor only)
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  setLectureAsPreview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.id;
      
      // Get the lecture and its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Get course to check ownership
      const course = await this.courseService.findById(lecture.courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.lectureService.setLectureAsPreview(lectureId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to set lecture as preview' });
        return;
      }
      
      res.json({ message: 'Lecture set as preview successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get the next lecture in sequence
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getNextLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lectureId = req.params.id;
      const nextLecture = await this.lectureService.getNextLecture(lectureId);
      
      if (!nextLecture) {
        res.json(null);
        return;
      }
      
      res.json(nextLecture);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get the previous lecture in sequence
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getPreviousLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lectureId = req.params.id;
      const previousLecture = await this.lectureService.getPreviousLecture(lectureId);
      
      if (!previousLecture) {
        res.json(null);
        return;
      }
      
      res.json(previousLecture);
    } catch (error) {
      next(error);
    }
  };
}

export default LectureController;