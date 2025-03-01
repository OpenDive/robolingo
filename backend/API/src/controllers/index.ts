import BaseController from './BaseController';
import UserController from './UserController';
import CourseController from './CourseController';
import LectureController from './LectureController';
import QuizController from './QuizController';
import EnrollmentController from './EnrollmentController';
import ProgressController from './ProgressController';

import {
  userService,
  courseService,
  lectureService,
  quizService,
  enrollmentService,
  progressService,
  blockchainService
} from '../services';

// Export controller classes
export {
  BaseController,
  UserController,
  CourseController,
  LectureController,
  QuizController,
  EnrollmentController,
  ProgressController
};

// Create and export controller instances for direct use in routes
export const userController = new UserController(userService);
export const courseController = new CourseController(courseService);
export const lectureController = new LectureController(
  lectureService,
  courseService,
  enrollmentService
);
export const quizController = new QuizController(
  quizService,
  courseService,
  lectureService,
  enrollmentService
);
export const enrollmentController = new EnrollmentController(
  enrollmentService,
  courseService,
  blockchainService,
  userService
);
export const progressController = new ProgressController(
  progressService,
  lectureService,
  courseService,
  enrollmentService
);