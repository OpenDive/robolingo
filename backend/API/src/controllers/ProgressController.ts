import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { ProgressService, LectureService, CourseService, EnrollmentService } from '../services';
import { UserRole } from '../models/User.model';

/**
 * Controller for progress-related API endpoints
 * Handles tracking and managing user progress in courses and lectures
 */
class ProgressController extends BaseController<any> {
  private progressService: ProgressService;
  private lectureService: LectureService;
  private courseService: CourseService;
  private enrollmentService: EnrollmentService;

  /**
   * Creates a controller with the required services
   * @param progressService - Service for progress operations
   * @param lectureService - Service for lecture operations
   * @param courseService - Service for course operations
   * @param enrollmentService - Service for enrollment operations
   */
  constructor(
    progressService: ProgressService,
    lectureService: LectureService,
    courseService: CourseService,
    enrollmentService: EnrollmentService
  ) {
    super(progressService);
    this.progressService = progressService;
    this.lectureService = lectureService;
    this.courseService = courseService;
    this.enrollmentService = enrollmentService;
  }

  /**
   * Get user's progress for a specific course
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getUserCourseProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.courseId;
      
      // Check if user is enrolled in the course
      const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, courseId);
      
      if (!isEnrolled) {
        res.status(403).json({ message: 'User is not enrolled in this course' });
        return;
      }
      
      const progress = await this.progressService.getUserCourseProgress(userId, courseId);
      res.json(progress);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user's progress for a specific lecture
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getUserLectureProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.lectureId;
      
      // Get the lecture to check its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Check if user is enrolled in the course
      const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, lecture.courseId);
      
      // Get course to check if user is instructor
      const course = await this.courseService.findById(lecture.courseId);
      const isInstructor = course?.instructor.id === userId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isEnrolled && !isInstructor && !isAdmin) {
        res.status(403).json({ message: 'User is not enrolled in this course' });
        return;
      }
      
      const progress = await this.progressService.getUserLectureProgress(userId, lectureId);
      res.json(progress || null);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Track user's progress in a lecture
   * @param req - Express request with lecture ID and progress data
   * @param res - Express response object
   * @param next - Express next function
   */
  trackLectureProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.lectureId;
      const { progress, lastPosition, notes } = req.body;
      
      if (progress === undefined || progress < 0 || progress > 100) {
        res.status(400).json({ message: 'Valid progress value (0-100) is required' });
        return;
      }
      
      try {
        const progressRecord = await this.progressService.trackLectureProgress(
          userId,
          lectureId,
          {
            progress,
            lastPosition,
            notes
          }
        );
        
        res.json(progressRecord);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'Lecture not found') {
            res.status(404).json({ message: error.message });
            return;
          }
          if (error.message === 'User is not enrolled in this course') {
            res.status(403).json({ message: error.message });
            return;
          }
          if (error.message === 'Enrollment not found') {
            res.status(404).json({ message: error.message });
            return;
          }
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark a lecture as completed
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  markLectureAsCompleted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.lectureId;
      
      // Get the lecture to check its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Check if user is enrolled in the course
      const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, lecture.courseId);
      
      if (!isEnrolled) {
        res.status(403).json({ message: 'User is not enrolled in this course' });
        return;
      }
      
      const success = await this.progressService.markLectureAsCompleted(userId, lectureId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to mark lecture as completed' });
        return;
      }
      
      res.json({ message: 'Lecture marked as completed' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Save user notes for a lecture
   * @param req - Express request with lecture ID and notes content
   * @param res - Express response object
   * @param next - Express next function
   */
  saveNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const lectureId = req.params.lectureId;
      const { notes } = req.body;
      
      if (!notes) {
        res.status(400).json({ message: 'Notes content is required' });
        return;
      }
      
      // Get the lecture to check its course
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Check if user is enrolled in the course
      const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, lecture.courseId);
      
      if (!isEnrolled) {
        res.status(403).json({ message: 'User is not enrolled in this course' });
        return;
      }
      
      const success = await this.progressService.saveNotes(userId, lectureId, notes);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to save notes' });
        return;
      }
      
      res.json({ message: 'Notes saved successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get the next unfinished lecture for a user in a course
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getNextUnfinishedLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.courseId;
      
      // Check if user is enrolled in the course
      const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, courseId);
      
      if (!isEnrolled) {
        res.status(403).json({ message: 'User is not enrolled in this course' });
        return;
      }
      
      const nextLectureId = await this.progressService.getNextUnfinishedLecture(userId, courseId);
      
      if (!nextLectureId) {
        res.json({ message: 'All lectures completed', nextLectureId: null });
        return;
      }
      
      res.json({ nextLectureId });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get overall course progress percentage
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getOverallCourseProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.courseId;
      
      // Check if user is enrolled in the course
      const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, courseId);
      
      // Get the course to check if user is instructor
      const course = await this.courseService.findById(courseId);
      const isInstructor = course?.instructor.id === userId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isEnrolled && !isInstructor && !isAdmin) {
        res.status(403).json({ message: 'User is not enrolled in this course' });
        return;
      }
      
      const progress = await this.progressService.getOverallCourseProgress(userId, courseId);
      res.json({ progress });
    } catch (error) {
      next(error);
    }
  };
}

export default ProgressController;