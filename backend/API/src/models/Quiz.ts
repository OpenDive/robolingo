import { 
    Model, 
    DataTypes, 
    Optional, 
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyCreateAssociationMixin,
    Association
  } from 'sequelize';
  import sequelize from '../config/database';
  import Course from './Course';
  import Lecture from './Lecture';
  import Question from './Question';
  
  // Quiz attributes interface
  interface QuizAttributes {
    id: string;
    title: string;
    description: string;
    courseId?: string;       // Optional: Quiz can be for a course
    lectureId?: string;      // Optional: Quiz can be for a lecture
    passingScore: number;    // Minimum percentage to pass
    timeLimit?: number;      // In minutes, null for unlimited
    attemptsAllowed?: number; // Null for unlimited attempts
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    questions?: Question[];
  }
  
  // Attributes for Quiz creation (optional id, timestamps)
  interface QuizCreationAttributes extends Optional<QuizAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'isActive'> {}
  
  /**
   * Quiz model representing assessments for courses or lectures
   * Can be associated with either a course (final quiz) or a lecture
   */
  class Quiz extends Model<QuizAttributes, QuizCreationAttributes> implements QuizAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public courseId!: string | undefined;
    public lectureId!: string | undefined;
    public passingScore!: number;
    public timeLimit!: number | undefined;
    public attemptsAllowed!: number | undefined;
    public isActive!: boolean;
    public questions?: Question[];
  
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // Association methods
    public getCourse!: BelongsToGetAssociationMixin<Course>;
    public setCourse!: BelongsToSetAssociationMixin<Course, string>;
    
    public getLecture!: BelongsToGetAssociationMixin<Lecture>;
    public setLecture!: BelongsToSetAssociationMixin<Lecture, string>;
    
    public getQuestions!: HasManyGetAssociationsMixin<any>;
    public addQuestion!: HasManyAddAssociationMixin<any, string>;
    public createQuestion!: HasManyCreateAssociationMixin<any>;
  
    // Add association definition in the Quiz model
    public static associations: {
      questions: Association<Quiz, Question>;
    };
  
    /**
     * Calculates the total possible points for the quiz
     * @returns Promise resolving to the sum of all question points
     */
    public async getTotalPoints(): Promise<number> {
      const questions = await this.getQuestions();
      return questions.reduce((sum, question) => sum + question.points, 0);
    }
  
    /**
     * Determines if a score passes the quiz
     * @param score - The score achieved on the quiz
     * @param totalPoints - The total possible points
     * @returns True if the score meets or exceeds the passing percentage
     */
    public isPassing(score: number, totalPoints: number): boolean {
      const percentage = (score / totalPoints) * 100;
      return percentage >= this.passingScore;
    }
  
    /**
     * Activates the quiz
     */
    public activate(): void {
      this.isActive = true;
    }
  
    /**
     * Deactivates the quiz
     */
    public deactivate(): void {
      this.isActive = false;
    }
  }
  
  // Initialize Quiz model with Sequelize
  Quiz.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      courseId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'courses',
          key: 'id',
        },
      },
      lectureId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'lectures',
          key: 'id',
        },
      },
      passingScore: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 70,
        validate: {
          min: 0,
          max: 100,
        },
        comment: 'Minimum percentage to pass',
      },
      timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Time limit in minutes, null for unlimited',
      },
      attemptsAllowed: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Number of attempts allowed, null for unlimited',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      modelName: 'Quiz',
      tableName: 'quizzes',
      indexes: [
        {
          name: 'quiz_course_id',
          fields: ['courseId'],
        },
        {
          name: 'quiz_lecture_id',
          fields: ['lectureId'],
        },
      ],
      validate: {
        // Custom validation to ensure either courseId or lectureId is set
        eitherCourseOrLecture() {
          if (!this.courseId && !this.lectureId) {
            throw new Error('A quiz must be associated with either a course or a lecture');
          }
          if (this.courseId && this.lectureId) {
            throw new Error('A quiz can only be associated with either a course or a lecture, not both');
          }
        },
      },
    }
  );
  
  // In the model initialization, define the association
  Quiz.hasMany(Question, {
    foreignKey: 'quizId',
    as: 'questions',
  });
  
  export default Quiz;