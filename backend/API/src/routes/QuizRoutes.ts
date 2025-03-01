import { Router } from 'express';
import { quizController } from '../controllers';
import auth from '../middleware/Auth';
import instructorAuth from '../middleware/InstructorAuth';
import { validate } from '../middleware/Validator';
import {
  createQuizValidation,
  updateQuizValidation,
  submitQuizValidation,
  courseIdValidation,
  lectureIdValidation,
  quizIdValidation
} from '../validations/QuizValidations';

/**
 * Quiz routes for quiz management and assessment
 * @returns Express Router configured with quiz-related routes
 */
const router = Router();

// Quiz access routes
router.get('/course/:courseId', auth, validate(courseIdValidation), quizController.getQuizByCourse);
router.get('/lecture/:lectureId', auth, validate(lectureIdValidation), quizController.getQuizByLecture);
router.get('/:id', auth, validate(quizIdValidation), quizController.getQuizWithQuestions);

// Quiz submission
router.post('/submit', auth, validate(submitQuizValidation), quizController.submitQuiz);

// Instructor routes for quiz management
router.post('/', auth, instructorAuth, validate(createQuizValidation), quizController.createQuizWithQuestions);
router.put('/:id', auth, validate([...quizIdValidation, ...updateQuizValidation]), quizController.updateQuizWithQuestions);
router.delete('/:id', auth, validate(quizIdValidation), quizController.deleteQuiz);

// Quiz status management
router.post('/:id/activate', auth, validate(quizIdValidation), quizController.activateQuiz);
router.post('/:id/deactivate', auth, validate(quizIdValidation), quizController.deactivateQuiz);

export default router;