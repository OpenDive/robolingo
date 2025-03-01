import { 
    Model, 
    DataTypes, 
    Optional, 
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin
  } from 'sequelize';
  import sequelize from '../config/database';
  import User from './User';
  import Lecture from './Lecture';
  import Enrollment from './Enrollment';
  
  // Progress attributes interface
  interface ProgressAttributes {
    id: string;
    userId: string;
    lectureId: string;
    enrollmentId: string;
    startedAt: Date;
    completedAt?: Date;
    isCompleted: boolean;
    progress: number;         // Percentage (0-100)
    lastPosition?: number;    // Position in video/audio in seconds
    notes?: string;           // User notes on the lecture
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Attributes for Progress creation
  interface ProgressCreationAttributes extends Optional<ProgressAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'startedAt' | 'isCompleted' | 'progress' | 'completedAt'> {}
  
  /**
   * Progress model tracking detailed user progress within individual lectures
   * Includes completion status and position tracking
   */
  class Progress extends Model<ProgressAttributes, ProgressCreationAttributes> implements ProgressAttributes {
    public id!: string;
    public userId!: string;
    public lectureId!: string;
    public enrollmentId!: string;
    public startedAt!: Date;
    public completedAt!: Date | undefined;
    public isCompleted!: boolean;
    public progress!: number;
    public lastPosition!: number | undefined;
    public notes!: string | undefined;
  
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // Association methods
    public getUser!: BelongsToGetAssociationMixin<User>;
    public setUser!: BelongsToSetAssociationMixin<User, string>;
    
    public getLecture!: BelongsToGetAssociationMixin<Lecture>;
    public setLecture!: BelongsToSetAssociationMixin<Lecture, string>;
    
    public getEnrollment!: BelongsToGetAssociationMixin<Enrollment>;
    public setEnrollment!: BelongsToSetAssociationMixin<Enrollment, string>;
  
    /**
     * Updates the progress percentage for the lecture
     * @param newProgress - Progress percentage (0-100)
     * @param position - Current position in video/audio (in seconds)
     */
    public updateProgress(newProgress: number, position?: number): void {
      this.progress = Math.min(Math.max(newProgress, 0), 100);
      
      if (position !== undefined) {
        this.lastPosition = position;
      }
      
      // Mark as completed if progress reaches 100%
      if (this.progress >= 100 && !this.isCompleted) {
        this.markAsCompleted();
      }
    }
  
    /**
     * Marks the lecture as completed
     */
    public markAsCompleted(): void {
      this.isCompleted = true;
      this.completedAt = new Date();
      this.progress = 100;
    }
  
    /**
     * Adds or updates user notes for the lecture
     * @param notes - The notes to save
     */
    public saveNotes(notes: string): void {
      this.notes = notes;
    }
  
    /**
     * Resets the completion status
     * Useful if content is updated and needs to be reviewed again
     */
    public resetProgress(): void {
      this.isCompleted = false;
      this.completedAt = undefined;
      this.progress = 0;
      this.lastPosition = 0;
    }
  }
  
  // Initialize Progress model with Sequelize
  Progress.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      lectureId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'lectures',
          key: 'id',
        },
      },
      enrollmentId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'enrollments',
          key: 'id',
        },
      },
      startedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      isCompleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
        comment: 'Percentage of lecture completed',
      },
      lastPosition: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Position in video/audio in seconds',
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'User notes on the lecture',
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
      modelName: 'Progress',
      tableName: 'progress',
      indexes: [
        {
          name: 'progress_user_id',
          fields: ['userId'],
        },
        {
          name: 'progress_lecture_id',
          fields: ['lectureId'],
        },
        {
          name: 'progress_enrollment_id',
          fields: ['enrollmentId'],
        },
        {
          name: 'progress_user_lecture',
          fields: ['userId', 'lectureId'],
          unique: true,
        },
      ],
    }
  );
  
  export default Progress;