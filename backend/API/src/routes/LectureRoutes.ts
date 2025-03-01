import { Router } from 'express';
import { lectureController } from '../controllers';
import auth from '../middleware/Auth';
import instructorAuth from '../middleware/InstructorAuth';
import { validate } from '../middleware/Validator';
import { 
  createLectureValidation, 
  updateLectureValidation, 
  reorderLecturesValidation,
  lectureIdValidation
} from '../validations/LectureValidations';

/**
 * Lecture routes for lecture management and delivery
 * @returns Express Router configured with lecture-related routes
 */
const router = Router();

// Lecture access routes
router.get('/:id', auth, validate(lectureIdValidation), lectureController.getLectureWithQuiz);
router.get('/:id/next', auth, validate(lectureIdValidation), lectureController.getNextLecture);
router.get('/:id/previous', auth, validate(lectureIdValidation), lectureController.getPreviousLecture);

// Instructor routes for lecture management
router.post('/', auth, instructorAuth, validate(createLectureValidation), lectureController.createLecture);
router.put('/:id', auth, validate([...lectureIdValidation, ...updateLectureValidation]), lectureController.updateLecture);
router.delete('/:id', auth, validate(lectureIdValidation), lectureController.deleteLecture);

// Lecture sequence and status management
router.post('/reorder/:courseId', auth, validate(reorderLecturesValidation), lectureController.reorderLectures);
router.post('/:id/publish', auth, validate(lectureIdValidation), lectureController.publishLecture);
router.post('/:id/unpublish', auth, validate(lectureIdValidation), lectureController.unpublishLecture);
router.post('/:id/preview', auth, validate(lectureIdValidation), lectureController.setLectureAsPreview);

export default router;