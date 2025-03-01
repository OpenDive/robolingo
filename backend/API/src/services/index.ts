import BaseService from './BaseService';
import UserService from './UserService';
import CourseService from './CourseService';
import LectureService from './LectureService';
import QuizService from './QuizService';
import EnrollmentService from './EnrollmentService';
import ProgressService from './ProgressService';

import { 
  userRepository, 
  courseRepository, 
  lectureRepository, 
  quizRepository,
  enrollmentRepository,
  progressRepository
} from '../repositories';

// Export service classes
export {
  BaseService,
  UserService,
  CourseService,
  LectureService,
  QuizService,
  EnrollmentService,
  ProgressService
};

// Create and export service instances for direct use in controllers
export const userService = new UserService(userRepository);
export const courseService = new CourseService(courseRepository, lectureRepository);
export const lectureService = new LectureService(lectureRepository, quizRepository);
export const quizService = new QuizService(quizRepository);
export const enrollmentService = new EnrollmentService(
  enrollmentRepository,
  courseRepository,
  progressRepository
);
export const progressService = new ProgressService(
  progressRepository,
  enrollmentRepository,
  lectureRepository
);