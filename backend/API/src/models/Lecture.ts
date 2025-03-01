import { 
    Model, 
    DataTypes, 
    Optional, 
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin,
    HasOneGetAssociationMixin,
    HasOneSetAssociationMixin,
    HasOneCreateAssociationMixin
  } from 'sequelize';
  import sequelize from '../config/database';
  import Course from './Course';
  
  // Lecture type enum
  export enum LectureType {
    VIDEO = 'video',
    AUDIO = 'audio',
    TEXT = 'text',
    INTERACTIVE = 'interactive'
  }
  
  // Lecture attributes interface
  interface LectureAttributes {
    id: string;
    title: string;
    description: string;
    courseId: string;
    type: LectureType;
    content: string; // Text content or URL to video/audio
    duration: number; // in minutes
    order: number; // Position in the course
    isPublished: boolean;
    isPreview: boolean; // Can be viewed without enrollment
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Attributes for Lecture creation (optional id, createdAt, updatedAt)
  interface LectureCreationAttributes extends Optional<LectureAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'isPublished' | 'isPreview'> {}
  
  /**
   * Lecture model representing an individual lesson within a course
   * Includes content, duration, and position within the course
   */
  class Lecture extends Model<LectureAttributes, LectureCreationAttributes> implements LectureAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public courseId!: string;
    public type!: LectureType;
    public content!: string;
    public duration!: number;
    public order!: number;
    public isPublished!: boolean;
    public isPreview!: boolean;
  
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // Association methods
    public getCourse!: BelongsToGetAssociationMixin<Course>;
    public setCourse!: BelongsToSetAssociationMixin<Course, string>;
    
    public getQuiz!: HasOneGetAssociationMixin<any>;
    public setQuiz!: HasOneSetAssociationMixin<any, string>;
    public createQuiz!: HasOneCreateAssociationMixin<any>;
  
    /**
     * Publishes the lecture
     * Sets isPublished to true
     */
    public publish(): void {
      this.isPublished = true;
    }
  
    /**
     * Unpublishes the lecture
     * Sets isPublished to false
     */
    public unpublish(): void {
      this.isPublished = false;
    }
  
    /**
     * Sets the lecture as a preview
     * Sets isPreview to true
     */
    public setAsPreview(): void {
      this.isPreview = true;
    }
  
    /**
     * Removes the lecture from preview status
     * Sets isPreview to false
     */
    public removeFromPreview(): void {
      this.isPreview = false;
    }
  }
  
  // Initialize Lecture model with Sequelize
  Lecture.init(
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
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id',
        },
      },
      type: {
        type: DataTypes.ENUM(...Object.values(LectureType)),
        allowNull: false,
        defaultValue: LectureType.VIDEO,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Text content or URL to video/audio',
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Duration in minutes',
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Position in the course',
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      isPreview: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Can be viewed without enrollment',
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
      modelName: 'Lecture',
      tableName: 'lectures',
      indexes: [
        {
          name: 'lectures_course_id',
          fields: ['courseId'],
        },
        {
          name: 'lectures_order',
          fields: ['courseId', 'order'],
          unique: true,
        },
      ],
    }
  );
  
  export default Lecture;