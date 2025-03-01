import { 
    Model, 
    DataTypes, 
    Optional, 
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyCreateAssociationMixin 
  } from 'sequelize';
  import sequelize from '../config/database';
  import Quiz from './Quiz';
  
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
  interface QuestionCreationAttributes extends Optional<QuestionAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'options' | 'explanation' | 'order'> {}
  
  /**
   * Question model for quiz questions
   * Supports multiple question types with options and correct answers
   */
  class Question extends Model<QuestionAttributes, QuestionCreationAttributes> implements QuestionAttributes {
    public id!: string;
    public quizId!: string;
    public type!: QuestionType;
    public text!: string;
    public points!: number;
    public options!: string[] | undefined;
    public correctAnswer!: string;
    public explanation!: string | undefined;
    public order!: number;
  
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // Association methods
    public getQuiz!: BelongsToGetAssociationMixin<Quiz>;
    public setQuiz!: BelongsToSetAssociationMixin<Quiz, string>;
    
    /**
     * Checks if an answer is correct
     * @param userAnswer - The answer provided by the user
     * @returns True if the answer is correct, false otherwise
     */
    public isCorrect(userAnswer: string | string[]): boolean {
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
  
  // Initialize Question model with Sequelize
  Question.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      quizId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'quizzes',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM(...Object.values(QuestionType)),
        allowNull: false,
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      points: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      options: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'JSON array of options for multiple choice/matching',
      },
      correctAnswer: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'JSON for multiple answers or simple string',
      },
      explanation: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Explanation of the correct answer',
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Question',
      tableName: 'questions',
      indexes: [
        {
          name: 'question_quiz_id',
          fields: ['quizId'],
        },
        {
          name: 'question_order',
          fields: ['quizId', 'order'],
        },
      ],
      validate: {
        // Validate options based on question type
        validateOptions() {
          if (
            [
              QuestionType.MULTIPLE_CHOICE,
              QuestionType.MATCHING
            ].includes(this.type as QuestionType) &&
            (!this.options || !Array.isArray(this.options) || this.options.length < 2)
          ) {
            throw new Error(`${this.type} questions require at least 2 options`);
          }
          
          if (this.type === QuestionType.TRUE_FALSE) {
            if (this.correctAnswer !== 'true' && this.correctAnswer !== 'false') {
              throw new Error('True/False questions must have "true" or "false" as the correct answer');
            }
          }
        },
      },
    }
  );
  
  export default Question;