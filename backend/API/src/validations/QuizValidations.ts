import { body, param } from 'express-validator';
import { QuestionType } from '../models/Question';

/**
 * Validation schema for quiz creation
 */
export const createQuizValidation = [
  body('quiz.title')
    .notEmpty()
    .withMessage('Quiz title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  
  body('quiz.description')
    .notEmpty()
    .withMessage('Quiz description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('quiz.courseId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid course ID format'),
  
  body('quiz.lectureId')
    .optional()
    .isUUID(4)
    .withMessage('Invalid lecture ID format'),
  
  body('quiz.passingScore')
    .notEmpty()
    .withMessage('Passing score is required')
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  
  body('quiz.timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive integer in minutes'),
  
  body('quiz.attemptsAllowed')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Attempts allowed must be a positive integer'),
  
  body('questions')
    .isArray()
    .withMessage('Questions must be an array')
    .notEmpty()
    .withMessage('At least one question is required'),
  
  body('questions.*.type')
    .notEmpty()
    .withMessage('Question type is required')
    .isIn(Object.values(QuestionType))
    .withMessage('Invalid question type'),
  
  body('questions.*.text')
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ max: 500 })
    .withMessage('Question text cannot exceed 500 characters')
    .trim(),
  
  body('questions.*.points')
    .notEmpty()
    .withMessage('Question points are required')
    .isInt({ min: 1 })
    .withMessage('Points must be a positive integer'),
  
  body('questions.*.options')
    .optional()
    .isArray()
    .withMessage('Options must be an array'),
  
  body('questions.*.correctAnswer')
    .notEmpty()
    .withMessage('Correct answer is required'),
  
  body('questions.*.explanation')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Explanation cannot exceed 500 characters')
    .trim()
];

/**
 * Validation schema for quiz update
 */
export const updateQuizValidation = [
  body('quiz.title')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
    .trim(),
  
  body('quiz.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
    .trim(),
  
  body('quiz.passingScore')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  
  body('quiz.timeLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Time limit must be a positive integer in minutes'),
  
  body('quiz.attemptsAllowed')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Attempts allowed must be a positive integer'),
  
  body('quiz.isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('questions.create')
    .optional()
    .isArray()
    .withMessage('New questions must be an array'),
  
  body('questions.update')
    .optional()
    .isArray()
    .withMessage('Updated questions must be an array'),
  
  body('questions.delete')
    .optional()
    .isArray()
    .withMessage('Deleted question IDs must be an array')
];

/**
 * Validation for quiz submission
 */
export const submitQuizValidation = [
  body('quizId')
    .notEmpty()
    .withMessage('Quiz ID is required')
    .isUUID(4)
    .withMessage('Invalid quiz ID format'),
  
  body('answers')
    .isArray()
    .withMessage('Answers must be an array')
    .notEmpty()
    .withMessage('At least one answer is required'),
  
  body('answers.*.questionId')
    .notEmpty()
    .withMessage('Question ID is required')
    .isUUID(4)
    .withMessage('Invalid question ID format'),
  
  body('answers.*.answer')
    .notEmpty()
    .withMessage('Answer is required')
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

/**
 * Validation for quiz ID parameter
 */
export const quizIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('Quiz ID is required')
    .isUUID(4)
    .withMessage('Invalid quiz ID format')
];