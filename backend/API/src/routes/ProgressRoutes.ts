import { Router } from 'express';
import { progressController } from '../controllers';
import auth from '../middleware/Auth';
import { validate } from '../middleware/Validator';
import {
  trackProgressValidation,
  saveNotesValidation,
  courseIdValidation,
  lectureIdValidation
} from '../validations/ProgressValidations';

/**
 * Progress routes for tracking user progress in courses and lectures
 * @returns Express Router configured with progress-related routes
 */
const router = Router();

// All progress routes require authentication
router.use(auth);

// Course progress routes
router.get('/course/:courseId', validate(courseIdValidation), progressController.getUserCourseProgress);
router.get('/course/:courseId/overall', validate(courseIdValidation), progressController.getOverallCourseProgress);
router.get('/course/:courseId/next', validate(courseIdValidation), progressController.getNextUnfinishedLecture);

// Lecture progress routes
router.get('/lecture/:lectureId', validate(lectureIdValidation), progressController.getUserLectureProgress);
router.post('/lecture/:lectureId', validate([...lectureIdValidation, ...trackProgressValidation]), progressController.trackLectureProgress);
router.post('/lecture/:lectureId/complete', validate(lectureIdValidation), progressController.markLectureAsCompleted);
router.post('/lecture/:lectureId/notes', validate([...lectureIdValidation, ...saveNotesValidation]), progressController.saveNotes);

export default router;