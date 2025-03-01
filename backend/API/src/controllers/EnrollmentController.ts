import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { EnrollmentService, CourseService } from '../services';
import { UserRole } from '../models/User';
import { EnrollmentStatus } from '../models/Enrollment';

/**
 * Controller for enrollment-related API endpoints
 * Handles user enrollments in courses
 */
class EnrollmentController extends BaseController<any> {
  private enrollmentService: EnrollmentService;
  private courseService: CourseService;

  /**
   * Creates a controller with the required services
   * @param enrollmentService - Service for enrollment operations
   * @param courseService - Service for course operations
   */
  constructor(
    enrollmentService: EnrollmentService,
    courseService: CourseService
  ) {
    super(enrollmentService);
    this.enrollmentService = enrollmentService;
    this.courseService = courseService;
  }

  /**
   * Get user's enrollments
   * @param req - Express request with authenticated user
   * @param res - Express response object
   * @param next - Express next function
   */
  getUserEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      // Optional status filter
      const status = req.query.status as EnrollmentStatus | undefined;
      
      // Validate status if provided
      if (status && !Object.values(EnrollmentStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }
      
      const enrollments = await this.enrollmentService.getUserEnrollments(userId, status);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get enrollments for a specific course (instructor/admin only)
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getCourseEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.courseId;
      
      // Get course to check ownership
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user is the course instructor or admin
      const isInstructor = userId === course.instructorId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      // Optional status filter
      const status = req.query.status as EnrollmentStatus | undefined;
      
      // Validate status if provided
      if (status && !Object.values(EnrollmentStatus).includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }
      
      const enrollments = await this.enrollmentService.getCourseEnrollments(courseId, status);
      res.json(enrollments);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Enroll user in a course
   * @param req - Express request with course ID and payment info
   * @param res - Express response object
   * @param next - Express next function
   */
  enrollInCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const { courseId, paymentId, expiresAt } = req.body;
      
      if (!courseId) {
        res.status(400).json({ message: 'Course ID is required' });
        return;
      }
      
      // Check if course exists and is published
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      if (!course.isPublished) {
        res.status(400).json({ message: 'Course is not available for enrollment' });
        return;
      }
      
      try {
        // Parse expiresAt date if provided
        let expirationDate: Date | undefined = undefined;
        if (expiresAt) {
          expirationDate = new Date(expiresAt);
          if (isNaN(expirationDate.getTime())) {
            throw new Error('Invalid expiration date');
          }
        }
        
        const enrollment = await this.enrollmentService.enrollUserInCourse(
          userId,
          courseId,
          paymentId,
          expirationDate
        );
        
        res.status(201).json(enrollment);
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === 'User is already enrolled in this course') {
            res.status(409).json({ message: error.message });
            return;
          }
          if (error.message === 'Invalid expiration date') {
            res.status(400).json({ message: error.message });
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
   * Check if user is enrolled in a course
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  checkEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const courseId = req.params.courseId;
      
      const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, courseId);
      res.json({ enrolled: isEnrolled });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Mark a course as completed
   * @param req - Express request with enrollment ID
   * @param res - Express response object
   * @param next - Express next function
   */
  markCourseAsCompleted = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      const success = await this.enrollmentService.markCourseAsCompleted(userId, courseId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to mark course as completed' });
        return;
      }
      
      res.json({ message: 'Course marked as completed' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Cancel enrollment (refund)
   * @param req - Express request with enrollment ID
   * @param res - Express response object
   * @param next - Express next function
   */
  cancelEnrollment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const enrollmentId = req.params.id;
      
      // Get the enrollment to check ownership
      const enrollment = await this.enrollmentService.findById(enrollmentId);
      
      if (!enrollment) {
        res.status(404).json({ message: 'Enrollment not found' });
        return;
      }
      
      // Check if user is the enrollment owner or an admin
      const isOwner = userId === enrollment.userId;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      const isInstructor = req.user?.role === UserRole.INSTRUCTOR;
      
      // Get course to check if user is the instructor
      let isCourseInstructor = false;
      if (isInstructor) {
        const course = await this.courseService.findById(enrollment.courseId);
        isCourseInstructor = course?.instructorId === userId;
      }
      
      if (!isOwner && !isAdmin && !isCourseInstructor) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const success = await this.enrollmentService.cancelEnrollment(enrollmentId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to cancel enrollment' });
        return;
      }
      
      res.json({ message: 'Enrollment cancelled and refund processed' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Issue certificate for a completed course
   * @param req - Express request with enrollment ID and certificate URL
   * @param res - Express response object
   * @param next - Express next function
   */
  issueCertificate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const enrollmentId = req.params.id;
      const { certificateUrl } = req.body;
      
      if (!certificateUrl) {
        res.status(400).json({ message: 'Certificate URL is required' });
        return;
      }
      
      // Get the enrollment to check completion status
      const enrollment = await this.enrollmentService.findById(enrollmentId);
      
      if (!enrollment) {
        res.status(404).json({ message: 'Enrollment not found' });
        return;
      }
      
      // Check if user is an admin or the course instructor
      const isAdmin = req.user?.role === UserRole.ADMIN;
      const isInstructor = req.user?.role === UserRole.INSTRUCTOR;
      
      // Get course to check if user is the instructor
      let isCourseInstructor = false;
      if (isInstructor) {
        const course = await this.courseService.findById(enrollment.courseId);
        isCourseInstructor = course?.instructorId === userId;
      }
      
      if (!isAdmin && !isCourseInstructor) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      // Check if enrollment is completed
      if (enrollment.status !== EnrollmentStatus.COMPLETED) {
        res.status(400).json({ message: 'Course is not completed' });
        return;
      }
      
      const success = await this.enrollmentService.issueCertificate(enrollmentId, certificateUrl);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to issue certificate' });
        return;
      }
      
      res.json({ message: 'Certificate issued successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Reset progress for a course
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  resetCourseProgress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      
      const success = await this.enrollmentService.resetCourseProgress(userId, courseId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to reset course progress' });
        return;
      }
      
      res.json({ message: 'Course progress reset successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Process expired enrollments (admin only)
   * @param req - Express request with authenticated admin user
   * @param res - Express response object
   * @param next - Express next function
   */
  processExpiredEnrollments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is admin
      if (req.user?.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }
      
      const count = await this.enrollmentService.processExpiredEnrollments();
      res.json({ 
        message: 'Expired enrollments processed',
        count
      });
    } catch (error) {
      next(error);
    }
  };
}

export default EnrollmentController;