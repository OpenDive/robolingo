import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import Course from './Course.model';

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
interface LectureCreationAttributes extends Partial<LectureAttributes> {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isPublished?: boolean;
  isPreview?: boolean;
}

/**
 * Lecture model representing an individual lesson within a course
 * Includes content, duration, and position within the course
 */
@Table({ tableName: 'lectures' })
export default class Lecture extends Model<LectureAttributes, LectureCreationAttributes> implements LectureAttributes {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  order!: number;

  @ForeignKey(() => Course)
  @Column({ type: DataType.UUID, allowNull: false })
  courseId!: string;

  @BelongsTo(() => Course)
  course!: Course;

  @Column({ type: DataType.TEXT, allowNull: false })
  description!: string;

  @Column({
    type: DataType.ENUM(...Object.values(LectureType)),
    allowNull: false,
    defaultValue: LectureType.VIDEO
  })
  type!: LectureType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Duration in minutes'
  })
  duration!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  isPublished!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Can be viewed without enrollment'
  })
  isPreview!: boolean;

  // Timestamps
  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  readonly createdAt!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  readonly updatedAt!: Date;

  /**
   * Publishes the lecture
   * Sets isPublished to true
   */
  publish(): void {
    this.isPublished = true;
  }

  /**
   * Unpublishes the lecture
   * Sets isPublished to false
   */
  unpublish(): void {
    this.isPublished = false;
  }

  /**
   * Sets the lecture as a preview
   * Sets isPreview to true
   */
  setAsPreview(): void {
    this.isPreview = true;
  }

  /**
   * Removes the lecture from preview status
   * Sets isPreview to false
   */
  removeFromPreview(): void {
    this.isPreview = false;
  }
}