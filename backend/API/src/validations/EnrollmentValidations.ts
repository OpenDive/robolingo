import { body, param, query } from 'express-validator';
import { EnrollmentStatus } from '../models/Enrollment.model';

/**
 * Validation schema for course enrollment
 */
export const enrollCourseValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID(4)
    .withMessage('Invalid course ID format'),
  
  body('paymentId')
    .optional()
    .isString()
    .withMessage('Payment ID must be a string')
    .trim(),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
];

/**
 * Validation for enrollment status filter
 */
export const enrollmentStatusValidation = [
  query('status')
    .optional()
    .isIn(Object.values(EnrollmentStatus))
    .withMessage('Invalid enrollment status')
];

/**
 * Validation for course ID parameter
 */
export const courseIdValidation = [
  param('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID(4)
    .withMessage('Invalid course ID format')
];

/**
 * Validation for enrollment ID parameter
 */
export const enrollmentIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Enrollment ID is required')
    .isUUID(4)
    .withMessage('Invalid enrollment ID format')
];

/**
 * Validation for certificate issuance
 */
export const certificateValidation = [
  body('certificateUrl')
    .notEmpty()
    .withMessage('Certificate URL is required')
    .isURL()
    .withMessage('Certificate URL must be a valid URL')
];