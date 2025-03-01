import { 
    Model, 
    DataTypes, 
    Optional, 
    BelongsToGetAssociationMixin,
    BelongsToSetAssociationMixin
  } from 'sequelize';
  import sequelize from '../config/database';
  import User from './User';
  import Course from './Course';
  
  // Enrollment status enum
  export enum EnrollmentStatus {
    ACTIVE = 'active',
    COMPLETED = 'completed',
    EXPIRED = 'expired',
    REFUNDED = 'refunded'
  }
  
  // Enrollment attributes interface
  interface EnrollmentAttributes {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: Date;
    expiresAt?: Date;
    status: EnrollmentStatus;
    completedAt?: Date;
    progress: number; // Percentage of course completed
    lastAccessedAt?: Date;
    certificateIssued: boolean;
    certificateUrl?: string;
    paymentId?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Attributes for Enrollment creation
  interface EnrollmentCreationAttributes extends Optional<EnrollmentAttributes, 
    'id' | 'createdAt' | 'updatedAt' | 'enrolledAt' | 'status' | 'progress' | 'certificateIssued'> {}
  
  /**
   * Enrollment model tracking student course enrollments
   * Includes progress tracking and completion status
   */
  class Enrollment extends Model<EnrollmentAttributes, EnrollmentCreationAttributes> implements EnrollmentAttributes {
    public id!: string;
    public userId!: string;
    public courseId!: string;
    public enrolledAt!: Date;
    public expiresAt!: Date | undefined;
    public status!: EnrollmentStatus;
    public completedAt!: Date | undefined;
    public progress!: number;
    public lastAccessedAt!: Date | undefined;
    public certificateIssued!: boolean;
    public certificateUrl!: string | undefined;
    public paymentId!: string | undefined;
  
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // Association methods
    public getUser!: BelongsToGetAssociationMixin<User>;
    public setUser!: BelongsToSetAssociationMixin<User, string>;
    
    public getCourse!: BelongsToGetAssociationMixin<Course>;
    public setCourse!: BelongsToSetAssociationMixin<Course, string>;
  
    /**
     * Updates the user's progress in the course
     * @param newProgress - The new progress percentage (0-100)
     */
    public updateProgress(newProgress: number): void {
      this.progress = Math.min(Math.max(newProgress, 0), 100);
      this.lastAccessedAt = new Date();
      
      // If progress reaches 100%, mark as completed
      if (this.progress === 100 && this.status === EnrollmentStatus.ACTIVE) {
        this.markAsCompleted();
      }
    }
  
    /**
     * Marks the enrollment as completed
     */
    public markAsCompleted(): void {
      this.status = EnrollmentStatus.COMPLETED;
      this.completedAt = new Date();
      this.progress = 100;
    }
  
    /**
     * Marks the enrollment as expired
     */
    public markAsExpired(): void {
      this.status = EnrollmentStatus.EXPIRED;
    }
  
    /**
     * Processes a refund for the enrollment
     */
    public processRefund(): void {
      this.status = EnrollmentStatus.REFUNDED;
    }
  
    /**
     * Issues a certificate for completed enrollment
     * @param certificateUrl - URL to the generated certificate
     */
    public issueCertificate(certificateUrl: string): void {
      this.certificateIssued = true;
      this.certificateUrl = certificateUrl;
    }
  
    /**
     * Checks if the enrollment is expired
     * @returns True if enrollment has an expiration date and it's in the past
     */
    public isExpired(): boolean {
      if (!this.expiresAt) return false;
      return new Date() > this.expiresAt;
    }
  }
  
  // Initialize Enrollment model with Sequelize
  Enrollment.init(
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
      courseId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id',
        },
      },
      enrolledAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date when the enrollment expires, if applicable',
      },
      status: {
        type: DataTypes.ENUM(...Object.values(EnrollmentStatus)),
        allowNull: false,
        defaultValue: EnrollmentStatus.ACTIVE,
      },
      completedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      progress: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          max: 100,
        },
        comment: 'Percentage of course completed',
      },
      lastAccessedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      certificateIssued: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      certificateUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Reference to payment system transaction ID',
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
      modelName: 'Enrollment',
      tableName: 'enrollments',
      indexes: [
        {
          name: 'enrollment_user_id',
          fields: ['userId'],
        },
        {
          name: 'enrollment_course_id',
          fields: ['courseId'],
        },
        {
          name: 'enrollment_user_course',
          fields: ['userId', 'courseId'],
          unique: true,
        },
      ],
    }
  );
  
  export default Enrollment;