import sequelize from '../config/database';
import BaseService from './BaseService';
import Quiz from '../models/Quiz.model';
import Question from '../models/Question.model';
import { QuestionType } from '../models/Question.model';
import QuizRepository from '../repositories/QuizRepository';

/**
 * Interface for quiz submission data
 */
interface QuizSubmission {
    quizId: string;
    userId: string;
    answers: Array<{
      questionId: string;
      answer: string | string[];
    }>;
  }
  
  /**
   * Interface for quiz result data
   */
  interface QuizResult {
    score: number;
    totalPoints: number;
    percentageScore: number;
    isPassing: boolean;
    questionResults: Array<{
      questionId: string;
      isCorrect: boolean;
      points: number;
      earnedPoints: number;
      correctAnswer: string | string[];
      userAnswer: string | string[];
      explanation?: string;
    }>;
  }
  
  /**
   * Service for quiz-related operations
   */
  class QuizService extends BaseService<Quiz, QuizRepository> {
    /**
     * Get a quiz by course ID
     * @param courseId - ID of the course
     * @returns Promise resolving to course quiz or null if not found
     */
    async getQuizByCourse(courseId: string): Promise<Quiz | null> {
      return this.repository.findByCourse(courseId);
    }
  
    /**
     * Get a quiz by lecture ID
     * @param lectureId - ID of the lecture
     * @returns Promise resolving to lecture quiz or null if not found
     */
    async getQuizByLecture(lectureId: string): Promise<Quiz | null> {
      return this.repository.findByLecture(lectureId);
    }
  
    /**
     * Get a quiz with all its questions
     * @param quizId - ID of the quiz
     * @returns Promise resolving to quiz with questions or null if not found
     */
    async getQuizWithQuestions(quizId: string): Promise<Quiz | null> {
      return this.repository.getWithQuestions(quizId);
    }
  
    /**
     * Create a new quiz with questions
     * @param quizData - Quiz data
     * @param questions - Array of question data
     * @returns Promise resolving to created quiz with questions
     */
    async createQuizWithQuestions(
      quizData: {
        title: string;
        description: string;
        courseId?: string;
        lectureId?: string;
        passingScore: number;
        timeLimit?: number;
        attemptsAllowed?: number;
      },
      questions: Array<{
        type: QuestionType;
        text: string;
        points: number;
        options?: string[];
        correctAnswer: string;
        explanation?: string;
      }>
    ): Promise<Quiz> {
      return this.repository.createWithQuestions(quizData, questions);
    }
  
    /**
     * Update an existing quiz and its questions
     * @param quizId - ID of the quiz
     * @param quizData - Updated quiz data
     * @param questionsData - Updated question data
     * @returns Promise resolving to updated quiz or null if not found
     */
    async updateQuizWithQuestions(
      quizId: string,
      quizData: Partial<{
        title: string;
        description: string;
        passingScore: number;
        timeLimit: number;
        attemptsAllowed: number;
        isActive: boolean;
      }>,
      questionsData: {
        create?: Array<{
          type: QuestionType;
          text: string;
          points: number;
          options?: string[];
          correctAnswer: string;
          explanation?: string;
        }>;
        update?: Array<{
          id: string;
          data: Partial<{
            type: QuestionType;
            text: string;
            points: number;
            options: string[];
            correctAnswer: string;
            explanation: string;
          }>;
        }>;
        delete?: string[];
      }
    ): Promise<Quiz | null> {
      return this.repository.updateWithQuestions(quizId, quizData, questionsData);
    }
  
    /**
     * Delete a quiz and its questions
     * @param quizId - ID of the quiz
     * @returns Promise resolving to boolean indicating success
     */
    async deleteQuiz(quizId: string): Promise<boolean> {
      const transaction = await sequelize.transaction();
  
      try {
        // Check if quiz exists
        const quiz = await this.repository.findById(quizId);
        if (!quiz) {
          await transaction.rollback();
          return false;
        }
  
        // Delete quiz (cascading deletion for questions handled by constraints)
        await this.repository.delete(quizId, { transaction });
  
        // Commit transaction
        await transaction.commit();
        return true;
      } catch (error) {
        // Rollback transaction on error
        await transaction.rollback();
        return false;
      }
    }
  
    /**
     * Reorder questions within a quiz
     * @param quizId - ID of the quiz
     * @param questionOrder - Array of question IDs in desired order
     * @returns Promise resolving to boolean indicating success
     */
    async reorderQuestions(quizId: string, questionOrder: string[]): Promise<boolean> {
      try {
        await this.repository.reorderQuestions(quizId, questionOrder);
        return true;
      } catch (error) {
        return false;
      }
    }
  
    /**
     * Submit a quiz for grading
     * @param submission - Quiz submission data
     * @returns Promise resolving to quiz result
     * @throws Error if quiz not found or invalid submission
     */
    async submitQuiz(submission: QuizSubmission): Promise<QuizResult> {
      // Get quiz with questions
      const quiz = await this.repository.getWithQuestions(submission.quizId);
      if (!quiz) {
        throw new Error('Quiz not found');
      }
  
      // Calculate total points
      const totalPoints = await quiz.getTotalPoints();
      
      // Create a map of questions by ID for easy access
      const questionsMap = new Map<string, Question>();
      const questions = await quiz.getQuestions();
      questions.forEach(question => questionsMap.set(question.id, question));
      
      // Process each answer and calculate score
      let score = 0;
      const questionResults = submission.answers.map(answer => {
        const question = questionsMap.get(answer.questionId);
        
        // Skip if question not found
        if (!question) {
          return {
            questionId: answer.questionId,
            isCorrect: false,
            points: 0,
            earnedPoints: 0,
            correctAnswer: '',
            userAnswer: answer.answer
          };
        }
        
        // Determine if answer is correct
        const isCorrect = question.isCorrect(answer.answer);
        const earnedPoints = isCorrect ? question.points : 0;
        
        // Add to total score
        score += earnedPoints;
        
        // Parse correct answer if it's a JSON string for certain question types
        let correctAnswer: string | string[] = question.correctAnswer;
        if ([QuestionType.MULTIPLE_CHOICE, QuestionType.MATCHING].includes(question.type)) {
          try {
            correctAnswer = JSON.parse(question.correctAnswer);
          } catch (e) {
            // Keep as string if not valid JSON
          }
        }
        
        return {
          questionId: question.id,
          isCorrect,
          points: question.points,
          earnedPoints,
          correctAnswer,
          userAnswer: answer.answer,
          explanation: question.explanation
        };
      });
      
      // Calculate percentage score and passing status
      const percentageScore = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
      const isPassing = quiz.isPassing(score, totalPoints);
      
      return {
        score,
        totalPoints,
        percentageScore,
        isPassing,
        questionResults
      };
    }
  
    /**
     * Activate a quiz
     * @param quizId - ID of the quiz
     * @returns Promise resolving to boolean indicating success
     */
    async activateQuiz(quizId: string): Promise<boolean> {
      try {
        await this.repository.activateQuiz(quizId);
        return true;
      } catch (error) {
        return false;
      }
    }
  
    /**
     * Deactivate a quiz
     * @param quizId - ID of the quiz
     * @returns Promise resolving to boolean indicating success
     */
    async deactivateQuiz(quizId: string): Promise<boolean> {
      try {
        await this.repository.deactivateQuiz(quizId);
        return true;
      } catch (error) {
        return false;
      }
    }
  }
  
  export default QuizService;