import { body, param } from 'express-validator';

/**
 * Validation schema for tracking lecture progress
 */
export const trackProgressValidation = [
  body('progress')
    .notEmpty()
    .withMessage('Progress percentage is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  
  body('lastPosition')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Last position must be a non-negative integer in seconds'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .trim()
];

/**
 * Validation for notes saving
 */
export const saveNotesValidation = [
  body('notes')
    .notEmpty()
    .withMessage('Notes content is required')
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters')
    .trim()
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
 * Validation for lecture ID parameter
 */
export const lectureIdValidation = [
  param('lectureId')
    .notEmpty()
    .withMessage('Lecture ID is required')
    .isUUID(4)
    .withMessage('Invalid lecture ID format')
];