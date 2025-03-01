import { body, param } from 'express-validator';
import { LectureType } from '../models/Lecture.model';

/**
 * Validation schema for lecture creation
 */
export const createLectureValidation = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID(4)
    .withMessage('Invalid course ID format'),
  
  body('title')
    .notEmpty()
    .withMessage('Lecture title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .notEmpty()
    .withMessage('Lecture description is required')
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  
  body('type')
    .notEmpty()
    .withMessage('Lecture type is required')
    .isIn(Object.values(LectureType))
    .withMessage('Invalid lecture type'),
  
  body('content')
    .notEmpty()
    .withMessage('Lecture content is required')
    .isLength({ max: 50000 })
    .withMessage('Content cannot exceed 50000 characters'),
  
  body('duration')
    .notEmpty()
    .withMessage('Lecture duration is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer in minutes'),
  
  body('order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer'),
  
  body('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview must be a boolean value')
];

/**
 * Validation schema for lecture update
 */
export const updateLectureValidation = [
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters')
    .trim(),
  
  body('type')
    .optional()
    .isIn(Object.values(LectureType))
    .withMessage('Invalid lecture type'),
  
  body('content')
    .optional()
    .isLength({ max: 50000 })
    .withMessage('Content cannot exceed 50000 characters'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer in minutes'),
  
  body('isPreview')
    .optional()
    .isBoolean()
    .withMessage('isPreview must be a boolean value')
];

/**
 * Validation for lecture reordering
 */
export const reorderLecturesValidation = [
  param('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID(4)
    .withMessage('Invalid course ID format'),
  
  body('lectureOrder')
    .isArray()
    .withMessage('Lecture order must be an array of lecture IDs')
    .notEmpty()
    .withMessage('Lecture order cannot be empty')
];

/**
 * Validation for lecture ID parameter
 */
export const lectureIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Lecture ID is required')
    .isUUID(4)
    .withMessage('Invalid lecture ID format')
];