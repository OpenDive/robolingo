import { Router } from 'express';
import { courseController, lectureController } from '../controllers';
import auth from '../middleware/Auth';
import instructorAuth from '../middleware/InstructorAuth';
import { validate } from '../middleware/Validator';
import { 
  createCourseValidation, 
  updateCourseValidation, 
  courseFilterValidation,
  paginationValidation,
  courseIdValidation
} from '../validations/CourseValidations';

/**
 * Course routes for course management and discovery
 * @returns Express Router configured with course-related routes
 */
const router = Router();

// Public routes for course discovery
router.get('/published', validate([...courseFilterValidation, ...paginationValidation]), courseController.getPublishedCourses);
router.get('/featured', validate(paginationValidation), courseController.getFeaturedCourses);
router.get('/:id/similar', validate([...courseIdValidation, ...paginationValidation]), courseController.getSimilarCourses);
router.get('/:id', validate(courseIdValidation), courseController.getCourseWithLectures);

// Instructor routes for course management
router.get('/instructor', auth, validate(paginationValidation), courseController.getInstructorCourses);
router.post('/', auth, instructorAuth, validate(createCourseValidation), courseController.createCourse);
router.post('/with-lectures', auth, instructorAuth, courseController.createCourseWithLectures);
router.put('/:id', auth, validate([...courseIdValidation, ...updateCourseValidation]), courseController.updateCourse);
router.post('/:id/publish', auth, validate(courseIdValidation), courseController.publishCourse);
router.post('/:id/unpublish', auth, validate(courseIdValidation), courseController.unpublishCourse);
router.delete('/:id', auth, validate(courseIdValidation), courseController.deleteCourse);

// Lecture routes within courses
router.get('/:courseId/lectures', validate(courseIdValidation), lectureController.getLecturesByCourse);

export default router;