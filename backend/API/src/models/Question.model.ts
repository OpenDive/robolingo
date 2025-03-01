import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Quiz from './Quiz.model';

// Question type enum
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay'
}

// Question attributes interface
interface QuestionAttributes {
  id: string;
  quizId: string;
  type: QuestionType;
  text: string;
  points: number;
  options?: string[]; // JSON array for multiple choice/matching
  correctAnswer: string; // JSON for multiple answers or simple string
  explanation?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Attributes for Question creation (optional id, timestamps)
interface QuestionCreationAttributes extends Partial<QuestionAttributes> {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  options?: string[];
  explanation?: string;
  order?: number;
}

@Table({
  tableName: 'questions',
  timestamps: true
})
export default class Question extends Model<Question> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @Column(DataType.TEXT)
  text!: string;

  @Column(DataType.JSONB)
  options!: string[];

  @Column(DataType.STRING)
  correctAnswer!: string;

  @ForeignKey(() => Quiz)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  quizId!: string;

  @BelongsTo(() => Quiz)
  quiz!: Quiz;

  @Column(DataType.ENUM(...Object.values(QuestionType)))
  type!: QuestionType;

  @Column(DataType.INTEGER)
  points!: number;

  @Column(DataType.TEXT)
  explanation!: string | undefined;

  @Column(DataType.INTEGER)
  order!: number;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;

  /**
   * Checks if an answer is correct
   * @param userAnswer - The answer provided by the user
   * @returns True if the answer is correct, false otherwise
   */
  isCorrect(userAnswer: string | string[]): boolean {
    // For simple string answers (true/false, fill-in-blank, short answer)
    if (typeof userAnswer === 'string') {
      return this.correctAnswer.toLowerCase() === userAnswer.toLowerCase();
    }
    
    // For multiple choice or matching questions with multiple answers
    if (Array.isArray(userAnswer)) {
      const correctAnswers = JSON.parse(this.correctAnswer);
      if (!Array.isArray(correctAnswers)) return false;
      
      if (correctAnswers.length !== userAnswer.length) return false;
      
      // Sort both arrays for comparison
      const sortedCorrect = [...correctAnswers].sort();
      const sortedUser = [...userAnswer].sort().map(a => a.toLowerCase());
      
      return sortedCorrect.every((answer, index) => 
        answer.toLowerCase() === sortedUser[index]);
    }
    
    return false;
  }
}