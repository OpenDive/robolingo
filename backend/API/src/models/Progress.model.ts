import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './User.model';
import Lecture from './Lecture.model';
import Course from './Course.model';

interface ProgressAttributes {
  id: string;
  userId: string;
  lectureId: string;
  courseId: string;
  progress: number;
  lastPosition?: number;
  notes?: string;
  completedAt?: Date;
}

@Table({
  tableName: 'progress',
  timestamps: true
})
export default class Progress extends Model<ProgressAttributes> implements ProgressAttributes {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  userId!: string;

  @ForeignKey(() => Lecture)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  lectureId!: string;

  @ForeignKey(() => Course)
  @Column({
    type: DataType.UUID,
    allowNull: false
  })
  courseId!: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00
  })
  progress!: number;

  @Column(DataType.INTEGER)
  lastPosition?: number;

  @Column(DataType.TEXT)
  notes?: string;

  @Column(DataType.DATE)
  completedAt?: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Lecture)
  lecture!: Lecture;

  @BelongsTo(() => Course)
  course!: Course;

  @Column(DataType.BOOLEAN)
  isCompleted!: boolean;

  public updateProgress(newProgress: number, lastPosition?: number): void {
    this.progress = Math.min(newProgress, 100);
    if (lastPosition !== undefined) {
      this.lastPosition = lastPosition;
    }
    if (this.progress >= 100) {
      this.completedAt = new Date();
      this.isCompleted = true;
    }
  }

  public saveNotes(notes: string): void {
    this.notes = notes;
  }

  public markAsCompleted(): void {
    this.completedAt = new Date();
    this.isCompleted = true;
  }

  public resetProgress(): void {
    this.progress = 0;
    this.completedAt = undefined;
    this.isCompleted = false;
    this.lastPosition = 0;
  }
}