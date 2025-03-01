import { 
    Model, 
    DataTypes, 
    Optional, 
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyCreateAssociationMixin,
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin
  } from 'sequelize';
  import sequelize from '../config/database';
  import User from './User';
  
  // Language proficiency levels enum
  export enum ProficiencyLevel {
    BEGINNER = 'beginner',
    ELEMENTARY = 'elementary',
    INTERMEDIATE = 'intermediate',
    UPPER_INTERMEDIATE = 'upper_intermediate',
    ADVANCED = 'advanced',
    PROFICIENT = 'proficient'
  }
  
  // Course attributes interface
  interface CourseAttributes {
    id: string;
    title: string;
    description: string;
    language: string;
    targetLanguage: string;
    level: ProficiencyLevel;
    price: number;
    duration: number; // in minutes
    thumbnailUrl?: string;
    instructorId: string;
    isPublished: boolean;
    publishedAt?: Date;
    averageRating?: number;
    ratingCount?: number;
    enrollmentCount?: number;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Attributes for Course creation (optional id, timestamps, and metrics)
  interface CourseCreationAttributes extends Optional<CourseAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'publishedAt' | 'isPublished' | 'averageRating' | 'ratingCount' | 'enrollmentCount'> {}
  
  /**
   * Course model representing a language course
   * Includes course details, pricing, and instructor association
   */
  class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
    public id!: string;
    public title!: string;
    public description!: string;
    public language!: string;
    public targetLanguage!: string;
    public level!: ProficiencyLevel;
    public price!: number;
    public duration!: number;
    public thumbnailUrl!: string | undefined;
    public instructorId!: string;
    public isPublished!: boolean;
    public publishedAt!: Date | undefined;
    public averageRating!: number | undefined;
    public ratingCount!: number | undefined;
    public enrollmentCount!: number | undefined;
  
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // Association methods
    public getInstructor!: BelongsToGetAssociationMixin<User>;
    public setInstructor!: BelongsToSetAssociationMixin<User, string>;
    
    public getLectures!: HasManyGetAssociationsMixin<any>;
    public addLecture!: HasManyAddAssociationMixin<any, string>;
    public createLecture!: HasManyCreateAssociationMixin<any>;
    
    public getEnrollments!: HasManyGetAssociationsMixin<any>;
    public addEnrollment!: HasManyAddAssociationMixin<any, string>;
    
    /**
     * Publishes the course
     * Sets isPublished to true and records the publish date
     */
    public publish(): void {
      this.isPublished = true;
      this.publishedAt = new Date();
    }
  
    /**
     * Unpublishes the course
     * Sets isPublished to false
     */
    public unpublish(): void {
      this.isPublished = false;
    }
  
    /**
     * Updates the average rating when a new review is added
     * @param newRating - The rating value from a new review
     */
    public updateRating(newRating: number): void {
      const currentCount = this.ratingCount || 0;
      const currentAvg = this.averageRating || 0;
      
      const newCount = currentCount + 1;
      const newAvg = ((currentAvg * currentCount) + newRating) / newCount;
      
      this.ratingCount = newCount;
      this.averageRating = newAvg;
    }
  
    /**
     * Increments the enrollment count by 1
     */
    public incrementEnrollment(): void {
      this.enrollmentCount = (this.enrollmentCount || 0) + 1;
    }
  }
  
  // Initialize Course model with Sequelize
  Course.init(
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
      language: {
        type: DataTypes.STRING, // The language in which the course is taught
        allowNull: false,
      },
      targetLanguage: {
        type: DataTypes.STRING, // The language being taught
        allowNull: false,
      },
      level: {
        type: DataTypes.ENUM(...Object.values(ProficiencyLevel)),
        allowNull: false,
        defaultValue: ProficiencyLevel.BEGINNER,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },
      duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Duration in minutes',
      },
      thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      instructorId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      publishedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      averageRating: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: null,
      },
      ratingCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      enrollmentCount: {
        type: DataTypes.INTEGER,
        allowNull: true,
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
      modelName: 'Course',
      tableName: 'courses',
      indexes: [
        {
          name: 'courses_instructor_id',
          fields: ['instructorId'],
        },
        {
          name: 'courses_language',
          fields: ['language', 'targetLanguage'],
        },
        {
          name: 'courses_level',
          fields: ['level'],
        },
      ],
    }
  );
  
  export default Course;