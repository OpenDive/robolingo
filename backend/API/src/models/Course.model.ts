import { Table, Model, Column, DataType, BelongsTo, HasMany } from 'sequelize-typescript';
import User from './User.model';
import Lecture from './Lecture.model';
import Enrollment from './Enrollment.model';

export enum ProficiencyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced'
}

@Table({ tableName: 'courses' })
export default class Course extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  language!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  targetLanguage!: string;

  @Column({ 
    type: DataType.ENUM(...Object.values(ProficiencyLevel)),
    allowNull: false
  })
  level!: ProficiencyLevel;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  price!: number;

  @Column({ 
    type: DataType.DECIMAL(3, 2), 
    defaultValue: 0.00 
  })
  averageRating!: number;

  @Column({ 
    type: DataType.INTEGER, 
    defaultValue: 0 
  })
  ratingCount!: number;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  totalStudents!: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isPublished!: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  publishedAt!: Date | null;

  @BelongsTo(() => User, 'instructorId')
  instructor!: User;

  @HasMany(() => Lecture)
  lectures!: Lecture[];

  @HasMany(() => Enrollment)
  enrollments!: Enrollment[];

  public updateRating(newRating: number): void {
    const currentTotal = this.averageRating * this.ratingCount;
    this.ratingCount += 1;
    this.averageRating = Number(((currentTotal + newRating) / this.ratingCount).toFixed(2));
  }

  public incrementEnrollment(): void {
    this.totalStudents += 1;
  }

  public publish(): void {
    this.isPublished = true;
    this.publishedAt = new Date();
  }

  public unpublish(): void {
    this.isPublished = false;
    this.publishedAt = null;
  }
}