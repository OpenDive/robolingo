import BaseRepository from './BaseRepository';
import UserRepository from './UserRepository';
import CourseRepository from './CourseRepository';
import LectureRepository from './LectureRepository';
import QuizRepository from './QuizRepository';
import EnrollmentRepository from './EnrollmentRepository';
import ProgressRepository from './ProgressRepository';

// Export repository classes
export {
  BaseRepository,
  UserRepository,
  CourseRepository,
  LectureRepository,
  QuizRepository,
  EnrollmentRepository,
  ProgressRepository
};

// Create and export repository instances for direct use in services
export const userRepository = new UserRepository();
export const courseRepository = new CourseRepository();
export const lectureRepository = new LectureRepository();
export const quizRepository = new QuizRepository();
export const enrollmentRepository = new EnrollmentRepository();
export const progressRepository = new ProgressRepository();