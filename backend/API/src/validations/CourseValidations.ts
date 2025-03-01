import { body, query, param } from 'express-validator';
import { ProficiencyLevel } from '../models/Course';

/**
 * Validation schema for course creation
 */
export const createCourseValidation = [
  body('title')
    .notEmpty()
    .withMessage('Course title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .notEmpty()
    .withMessage('Course description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .trim(),
  
  body('language')
    .notEmpty()
    .withMessage('Source language is required')
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code should be 2-5 characters')
    .trim(),
  
  body('targetLanguage')
    .notEmpty()
    .withMessage('Target language is required')
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code should be 2-5 characters')
    .trim(),
  
  body('level')
    .notEmpty()
    .withMessage('Proficiency level is required')
    .isIn(Object.values(ProficiencyLevel))
    .withMessage('Invalid proficiency level'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('duration')
    .notEmpty()
    .withMessage('Course duration is required')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer in minutes'),
  
  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL')
];

/**
 * Validation schema for course update
 */
export const updateCourseValidation = [
  body('title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters')
    .trim(),
  
  body('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code should be 2-5 characters')
    .trim(),
  
  body('targetLanguage')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code should be 2-5 characters')
    .trim(),
  
  body('level')
    .optional()
    .isIn(Object.values(ProficiencyLevel))
    .withMessage('Invalid proficiency level'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('duration')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer in minutes'),
  
  body('thumbnailUrl')
    .optional()
    .isURL()
    .withMessage('Thumbnail must be a valid URL')
];

/**
 * Validation schema for course filtering
 */
export const courseFilterValidation = [
  query('language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code should be 2-5 characters'),
  
  query('targetLanguage')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code should be 2-5 characters'),
  
  query('level')
    .optional()
    .isIn(Object.values(ProficiencyLevel))
    .withMessage('Invalid proficiency level'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  
  query('search')
    .optional()
    .isString()
    .trim()
];

/**
 * Validation for pagination parameters
 */
export const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation for course ID parameter
 */
export const courseIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Course ID is required')
    .isUUID(4)
    .withMessage('Invalid course ID format')
];