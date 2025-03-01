import User from './User';
import Course from './Course';
import Lecture from './Lecture';
import Quiz from './Quiz';
import Question from './Question';
import Enrollment from './Enrollment';
import Progress from './Progress';

// Define associations between models

// User associations
User.hasMany(Course, {
  foreignKey: 'instructorId',
  as: 'courses'
});

User.hasMany(Enrollment, {
  foreignKey: 'userId',
  as: 'enrollments'
});

User.hasMany(Progress, {
  foreignKey: 'userId',
  as: 'progress'
});

// Course associations
Course.belongsTo(User, {
  foreignKey: 'instructorId',
  as: 'instructor'
});

Course.hasMany(Lecture, {
  foreignKey: 'courseId',
  as: 'lectures'
});

Course.hasOne(Quiz, {
  foreignKey: 'courseId',
  as: 'finalQuiz'
});

Course.hasMany(Enrollment, {
  foreignKey: 'courseId',
  as: 'enrollments'
});

// Lecture associations
Lecture.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

Lecture.hasOne(Quiz, {
  foreignKey: 'lectureId',
  as: 'quiz'
});

Lecture.hasMany(Progress, {
  foreignKey: 'lectureId',
  as: 'progress'
});

// Quiz associations
Quiz.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

Quiz.belongsTo(Lecture, {
  foreignKey: 'lectureId',
  as: 'lecture'
});

Quiz.hasMany(Question, {
  foreignKey: 'quizId',
  as: 'questions'
});

// Question associations
Question.belongsTo(Quiz, {
  foreignKey: 'quizId',
  as: 'quiz'
});

// Enrollment associations
Enrollment.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Enrollment.belongsTo(Course, {
  foreignKey: 'courseId',
  as: 'course'
});

Enrollment.hasMany(Progress, {
  foreignKey: 'enrollmentId',
  as: 'progress'
});

// Progress associations
Progress.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Progress.belongsTo(Lecture, {
  foreignKey: 'lectureId',
  as: 'lecture'
});

Progress.belongsTo(Enrollment, {
  foreignKey: 'enrollmentId',
  as: 'enrollment'
});

// Export models
export {
  User,
  Course,
  Lecture,
  Quiz,
  Question,
  Enrollment,
  Progress
};