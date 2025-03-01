import { Transaction } from 'sequelize';
import BaseRepository from './BaseRepository';
import Quiz from '../models/Quiz.model';
import Question from '../models/Question.model';

/**
 * Repository for Quiz-specific data operations
 * Extends BaseRepository with additional quiz-focused methods
 */
class QuizRepository extends BaseRepository<Quiz> {
  constructor() {
    super(Quiz);
  }

  /**
   * Find a quiz by course ID
   * @param courseId - ID of the course
   * @returns Promise resolving to the course quiz or null
   */
  async findByCourse(courseId: string): Promise<Quiz | null> {
    return this.findOne({
      where: {
        courseId,
        isActive: true
      }
    });
  }

  /**
   * Find a quiz by lecture ID
   * @param lectureId - ID of the lecture
   * @returns Promise resolving to the lecture quiz or null
   */
  async findByLecture(lectureId: string): Promise<Quiz | null> {
    return this.findOne({
      where: {
        lectureId,
        isActive: true
      }
    });
  }

  /**
   * Get a quiz with all its questions
   * @param quizId - ID of the quiz
   * @returns Promise resolving to quiz with questions
   */
  async getWithQuestions(quizId: string): Promise<Quiz | null> {
    return this.findById(quizId, {
      include: [
        {
          model: Question,
          as: 'questions',
          order: [['order', 'ASC']]
        }
      ]
    });
  }

  /**
   * Create a new quiz with questions
   * @param quizData - Quiz data
   * @param questions - Array of question data
   * @param transaction - Optional transaction
   * @returns Promise resolving to the created quiz
   */
  async createWithQuestions(
    quizData: any,
    questions: any[],
    transaction?: Transaction
  ): Promise<Quiz> {
    // Create the quiz
    const quiz = await this.create(quizData, { transaction });
    
    // Add questions to the quiz
    if (questions.length > 0) {
      const questionPromises = questions.map((questionData, index) => {
        return quiz.createQuestion({
          ...questionData,
          quizId: quiz.id,
          order: index
        }, { transaction });
      });
      
      await Promise.all(questionPromises);
    }
    
    return this.getWithQuestions(quiz.id) as Promise<Quiz>;
  }

  /**
   * Update a quiz and its questions
   * @param quizId - ID of the quiz
   * @param quizData - Updated quiz data
   * @param questionsData - Updated question data
   * @param transaction - Optional transaction
   * @returns Promise resolving to the updated quiz
   */
  async updateWithQuestions(
    quizId: string,
    quizData: any,
    questionsData: { 
      create?: any[],
      update?: { id: string, data: any }[],
      delete?: string[]
    },
    transaction?: Transaction
  ): Promise<Quiz | null> {
    // Get the quiz
    const quiz = await this.findById(quizId);
    
    if (!quiz) {
      return null;
    }
    
    // Update quiz data
    await this.update(quizId, quizData, { 
      where: { id: quizId },  // Add where clause
      transaction 
    });
    
    // Handle question operations
    if (questionsData) {
      // Create new questions
      if (questionsData.create && questionsData.create.length > 0) {
        const existingQuestions = await quiz.getQuestions();
        const lastOrder = existingQuestions.length > 0 
          ? Math.max(...existingQuestions.map(q => q.order))
          : -1;
        
        const createPromises = questionsData.create.map((questionData, index) => {
          return quiz.createQuestion({
            ...questionData,
            quizId: quiz.id,
            order: lastOrder + index + 1
          }, { transaction });
        });
        
        await Promise.all(createPromises);
      }
      
      // Update existing questions
      if (questionsData.update && questionsData.update.length > 0) {
        const updatePromises = questionsData.update.map(item => {
          return Question.update(item.data, {
            where: { id: item.id },
            transaction
          });
        });
        
        await Promise.all(updatePromises);
      }
      
      // Delete questions
      if (questionsData.delete && questionsData.delete.length > 0) {
        await Question.destroy({
          where: {
            id: questionsData.delete
          },
          transaction
        });
      }
    }
    
    return this.getWithQuestions(quizId);
  }

  /**
   * Reorder questions within a quiz
   * @param quizId - ID of the quiz
   * @param questionOrder - Array of question IDs in the desired order
   * @param transaction - Optional transaction
   * @returns Promise resolving when the update completes
   */
  async reorderQuestions(
    quizId: string,
    questionOrder: string[],
    transaction?: Transaction
  ): Promise<void> {
    const quiz = await this.getWithQuestions(quizId);
    
    if (!quiz) {
      return;
    }
    
    const questions = await quiz.getQuestions();
    
    // Map questions by ID for easy lookup
    const questionMap = new Map<string, Question>();
    questions.forEach((question: Question) => questionMap.set(question.id, question));
    
    // Update order for each question
    const updatePromises = questionOrder.map((questionId, index) => {
      const question = questionMap.get(questionId);
      
      if (question && question.order !== index) {
        question.order = index;
        return question.save({ transaction });
      }
      
      return Promise.resolve();
    });
    
    await Promise.all(updatePromises);
  }
  
  /**
   * Activate a quiz
   * @param quizId - ID of the quiz
   * @returns Promise resolving when the quiz is activated
   */
  async activateQuiz(quizId: string): Promise<void> {
    const quiz = await this.findById(quizId);
    
    if (quiz) {
      quiz.activate();
      await quiz.save();
    }
  }
  
  /**
   * Deactivate a quiz
   * @param quizId - ID of the quiz
   * @returns Promise resolving when the quiz is deactivated
   */
  async deactivateQuiz(quizId: string): Promise<void> {
    const quiz = await this.findById(quizId);
    
    if (quiz) {
      quiz.deactivate();
      await quiz.save();
    }
  }
}

export default QuizRepository;