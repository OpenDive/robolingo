import { Request, Response, NextFunction } from 'express';
import BaseController from './BaseController';
import { QuizService, CourseService, LectureService, EnrollmentService } from '../services';
import { UserRole } from '../models/User.model';

/**
 * Controller for quiz-related API endpoints
 * Handles quiz creation, taking, and submission
 */
class QuizController extends BaseController<any> {
  private quizService: QuizService;
  private courseService: CourseService;
  private lectureService: LectureService;
  private enrollmentService: EnrollmentService;

  /**
   * Creates a controller with the required services
   * @param quizService - Service for quiz operations
   * @param courseService - Service for course operations
   * @param lectureService - Service for lecture operations
   * @param enrollmentService - Service for enrollment operations
   */
  constructor(
    quizService: QuizService,
    courseService: CourseService,
    lectureService: LectureService,
    enrollmentService: EnrollmentService
  ) {
    super(quizService);
    this.quizService = quizService;
    this.courseService = courseService;
    this.lectureService = lectureService;
    this.enrollmentService = enrollmentService;
  }

  /**
   * Get a quiz by course ID
   * @param req - Express request with course ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getQuizByCourse = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const courseId = req.params.courseId;
      const userId = req.user?.id;
      
      // Get the course to check access
      const course = await this.courseService.findById(courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user has access to the course
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      
      if (!isInstructor && !isAdmin) {
        if (!userId) {
          res.status(401).json({ message: 'Authentication required' });
          return;
        }
        
        const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, courseId);
        
        if (!isEnrolled) {
          res.status(403).json({ message: 'Enrollment required to access this quiz' });
          return;
        }
      }
      
      const quiz = await this.quizService.getQuizByCourse(courseId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found for this course' });
        return;
      }
      
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a quiz by lecture ID
   * @param req - Express request with lecture ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getQuizByLecture = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const lectureId = req.params.lectureId;
      const userId = req.user?.id;
      
      // Get the lecture to check access
      const lecture = await this.lectureService.findById(lectureId);
      
      if (!lecture) {
        res.status(404).json({ message: 'Lecture not found' });
        return;
      }
      
      // Get the course to check access
      const course = await this.courseService.findById(lecture.courseId);
      
      if (!course) {
        res.status(404).json({ message: 'Course not found' });
        return;
      }
      
      // Check if user has access to the lecture
      const isInstructor = userId === course.instructor.id;
      const isAdmin = req.user?.role === UserRole.ADMIN;
      const isPreview = lecture.isPreview;
      
      if (!isPreview && !isInstructor && !isAdmin) {
        if (!userId) {
          res.status(401).json({ message: 'Authentication required' });
          return;
        }
        
        const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, course.id);
        
        if (!isEnrolled) {
          res.status(403).json({ message: 'Enrollment required to access this quiz' });
          return;
        }
      }
      
      const quiz = await this.quizService.getQuizByLecture(lectureId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found for this lecture' });
        return;
      }
      
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a quiz with its questions
   * @param req - Express request with quiz ID
   * @param res - Express response object
   * @param next - Express next function
   */
  getQuizWithQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const quizId = req.params.id;
      const userId = req.user?.id;
      
      const quiz = await this.quizService.getQuizWithQuestions(quizId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found' });
        return;
      }
      
      // Check if user has access to the quiz
      const courseId = quiz.courseId;
      const lectureId = quiz.lectureId;
      
      // For course quiz
      if (courseId) {
        const course = await this.courseService.findById(courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
          }
          
          const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, courseId);
          
          if (!isEnrolled) {
            res.status(403).json({ message: 'Enrollment required to access this quiz' });
            return;
          }
        }
      }
      
      // For lecture quiz
      if (lectureId) {
        const lecture = await this.lectureService.findById(lectureId);
        
        if (!lecture) {
          res.status(404).json({ message: 'Lecture not found' });
          return;
        }
        
        const course = await this.courseService.findById(lecture.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        const isPreview = lecture.isPreview;
        
        if (!isPreview && !isInstructor && !isAdmin) {
          if (!userId) {
            res.status(401).json({ message: 'Authentication required' });
            return;
          }
          
          const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, course.id);
          
          if (!isEnrolled) {
            res.status(403).json({ message: 'Enrollment required to access this quiz' });
            return;
          }
        }
      }
      
      // If we're showing to a student, remove correctAnswer and explanation from questions
      if (userId && req.user?.role === UserRole.STUDENT) {
        // Sanitize questions to not reveal answers
        const sanitizedQuestions = quiz.questions?.map((question: any) => {
          const { correctAnswer, explanation, ...sanitizedQuestion } = question.toJSON();
          return sanitizedQuestion;
        });
        
        // Create a sanitized quiz object
        const sanitizedQuiz = {
          ...quiz.toJSON(),
          questions: sanitizedQuestions
        };
        
        res.json(sanitizedQuiz);
        return;
      }
      
      // Show full quiz for instructors and admins
      res.json(quiz);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new quiz with questions (instructor only)
   * @param req - Express request with quiz data
   * @param res - Express response object
   * @param next - Express next function
   */
  createQuizWithQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const { quiz: quizData, questions } = req.body;
      
      if (!quizData || !questions || !Array.isArray(questions)) {
        res.status(400).json({ message: 'Invalid request format' });
        return;
      }
      
      // Check if user has permission to create quiz for this course/lecture
      if (quizData.courseId) {
        const course = await this.courseService.findById(quizData.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      if (quizData.lectureId) {
        const lecture = await this.lectureService.findById(quizData.lectureId);
        
        if (!lecture) {
          res.status(404).json({ message: 'Lecture not found' });
          return;
        }
        
        const course = await this.courseService.findById(lecture.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      const quiz = await this.quizService.createQuizWithQuestions(quizData, questions);
      res.status(201).json(quiz);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing quiz with questions (instructor only)
   * @param req - Express request with quiz ID and update data
   * @param res - Express response object
   * @param next - Express next function
   */
  updateQuizWithQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const quizId = req.params.id;
      const { quiz: quizData, questions: questionsData } = req.body;
      
      // Get the quiz to check ownership
      const quiz = await this.quizService.findById(quizId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found' });
        return;
      }
      
      // Check if user has permission to update this quiz
      if (quiz.courseId) {
        const course = await this.courseService.findById(quiz.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      if (quiz.lectureId) {
        const lecture = await this.lectureService.findById(quiz.lectureId);
        
        if (!lecture) {
          res.status(404).json({ message: 'Lecture not found' });
          return;
        }
        
        const course = await this.courseService.findById(lecture.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      const updatedQuiz = await this.quizService.updateQuizWithQuestions(quizId, quizData, questionsData);
      
      if (!updatedQuiz) {
        res.status(400).json({ message: 'Failed to update quiz' });
        return;
      }
      
      res.json(updatedQuiz);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a quiz (instructor only)
   * @param req - Express request with quiz ID
   * @param res - Express response object
   * @param next - Express next function
   */
  deleteQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const quizId = req.params.id;
      
      // Get the quiz to check ownership
      const quiz = await this.quizService.findById(quizId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found' });
        return;
      }
      
      // Check if user has permission to delete this quiz
      if (quiz.courseId) {
        const course = await this.courseService.findById(quiz.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      if (quiz.lectureId) {
        const lecture = await this.lectureService.findById(quiz.lectureId);
        
        if (!lecture) {
          res.status(404).json({ message: 'Lecture not found' });
          return;
        }
        
        const course = await this.courseService.findById(lecture.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      const success = await this.quizService.deleteQuiz(quizId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to delete quiz' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Submit a quiz for grading
   * @param req - Express request with submission data
   * @param res - Express response object
   * @param next - Express next function
   */
  submitQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const { quizId, answers } = req.body;
      
      if (!quizId || !answers || !Array.isArray(answers)) {
        res.status(400).json({ message: 'Invalid request format' });
        return;
      }
      
      // Get the quiz to check access
      const quiz = await this.quizService.findById(quizId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found' });
        return;
      }
      
      // Check if user has access to submit this quiz
      if (quiz.courseId) {
        const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, quiz.courseId);
        
        if (!isEnrolled) {
          res.status(403).json({ message: 'Enrollment required to submit this quiz' });
          return;
        }
      }
      
      if (quiz.lectureId) {
        const lecture = await this.lectureService.findById(quiz.lectureId);
        
        if (!lecture) {
          res.status(404).json({ message: 'Lecture not found' });
          return;
        }
        
        const isEnrolled = await this.enrollmentService.isUserEnrolled(userId, lecture.courseId);
        
        if (!isEnrolled) {
          res.status(403).json({ message: 'Enrollment required to submit this quiz' });
          return;
        }
      }
      
      const result = await this.quizService.submitQuiz({
        quizId,
        userId,
        answers
      });
      
      res.json(result);
    } catch (error) {
      if (error instanceof Error && error.message === 'Quiz not found') {
        res.status(404).json({ message: error.message });
        return;
      }
      next(error);
    }
  };

  /**
   * Activate a quiz (instructor only)
   * @param req - Express request with quiz ID
   * @param res - Express response object
   * @param next - Express next function
   */
  activateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const quizId = req.params.id;
      
      // Get the quiz to check ownership
      const quiz = await this.quizService.findById(quizId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found' });
        return;
      }
      
      // Check if user has permission to update this quiz
      if (quiz.courseId) {
        const course = await this.courseService.findById(quiz.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      if (quiz.lectureId) {
        const lecture = await this.lectureService.findById(quiz.lectureId);
        
        if (!lecture) {
          res.status(404).json({ message: 'Lecture not found' });
          return;
        }
        
        const course = await this.courseService.findById(lecture.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      const success = await this.quizService.activateQuiz(quizId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to activate quiz' });
        return;
      }
      
      res.json({ message: 'Quiz activated successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deactivate a quiz (instructor only)
   * @param req - Express request with quiz ID
   * @param res - Express response object
   * @param next - Express next function
   */
  deactivateQuiz = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }
      
      const quizId = req.params.id;
      
      // Get the quiz to check ownership
      const quiz = await this.quizService.findById(quizId);
      
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found' });
        return;
      }
      
      // Check if user has permission to update this quiz
      if (quiz.courseId) {
        const course = await this.courseService.findById(quiz.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      if (quiz.lectureId) {
        const lecture = await this.lectureService.findById(quiz.lectureId);
        
        if (!lecture) {
          res.status(404).json({ message: 'Lecture not found' });
          return;
        }
        
        const course = await this.courseService.findById(lecture.courseId);
        
        if (!course) {
          res.status(404).json({ message: 'Course not found' });
          return;
        }
        
        const isInstructor = userId === course.instructor.id;
        const isAdmin = req.user?.role === UserRole.ADMIN;
        
        if (!isInstructor && !isAdmin) {
          res.status(403).json({ message: 'Access denied' });
          return;
        }
      }
      
      const success = await this.quizService.deactivateQuiz(quizId);
      
      if (!success) {
        res.status(400).json({ message: 'Failed to deactivate quiz' });
        return;
      }
      
      res.json({ message: 'Quiz deactivated successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default QuizController;