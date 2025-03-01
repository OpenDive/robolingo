import { Router } from 'express';
import { enrollmentController } from '../controllers';
import auth from '../middleware/Auth';
import adminAuth from '../middleware/AdminAuth';
import { validate } from '../middleware/Validator';
import {
  enrollCourseValidation,
  enrollmentStatusValidation,
  courseIdValidation,
  enrollmentIdValidation,
  certificateValidation
} from '../validations/EnrollmentValidations';

/**
 * Enrollment routes for course enrollment management
 * @returns Express Router configured with enrollment-related routes
 */
const router = Router();

// User enrollment routes
router.get('/user', auth, validate(enrollmentStatusValidation), enrollmentController.getUserEnrollments);
router.post('/', auth, validate(enrollCourseValidation), enrollmentController.enrollInCourse);
router.get('/check/:courseId', auth, validate(courseIdValidation), enrollmentController.checkEnrollment);
router.post('/:courseId/complete', auth, validate(courseIdValidation), enrollmentController.markCourseAsCompleted);
router.post('/:courseId/reset', auth, validate(courseIdValidation), enrollmentController.resetCourseProgress);

// Instructor/admin routes
router.get('/course/:courseId', auth, validate(courseIdValidation), enrollmentController.getCourseEnrollments);
router.post('/:id/certificate', auth, validate([...enrollmentIdValidation, ...certificateValidation]), enrollmentController.issueCertificate);
router.post('/:id/cancel', auth, validate(enrollmentIdValidation), enrollmentController.cancelEnrollment);

// Admin-only routes
router.post('/process-expired', auth, adminAuth, enrollmentController.processExpiredEnrollments);

export default router;