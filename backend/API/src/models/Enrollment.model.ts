import { Table, Model, Column, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import User from './User.model';
import Course from './Course.model';

export enum EnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

@Table({ tableName: 'enrollments' })
export default class Enrollment extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  @ForeignKey(() => Course)
  @Column({ type: DataType.UUID, allowNull: false })
  courseId!: string;

  @Column({ 
    type: DataType.ENUM(...Object.values(EnrollmentStatus)),
    defaultValue: EnrollmentStatus.ACTIVE
  })
  status!: EnrollmentStatus;

  @Column({ type: DataType.DATE, allowNull: false })
  enrolledAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  completedAt!: Date | null;

  @Column(DataType.DATE)
  expiresAt!: Date;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Course)
  course!: Course;

  @Column({ type: DataType.STRING, allowNull: true })
  transactionHash!: string | null;

  @Column({ type: DataType.DECIMAL(10, 2), allowNull: false })
  stake!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  challengeType!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  progress!: number;

  @Column({ type: DataType.STRING, allowNull: true })
  certificateUrl!: string | null;

  /**
   * Process refund for cancelled enrollment
   * Updates status and refund amount
   */
  public processRefund(): void {
    if (this.status !== EnrollmentStatus.ACTIVE) {
      throw new Error('Only active enrollments can be refunded');
    }
    
    this.status = EnrollmentStatus.CANCELLED;
    // TODO: Add refund logic here (e.g., update blockchain transaction)
  }

  public updateProgress(newProgress: number): void {
    this.progress = Math.min(Math.max(newProgress, 0), 100);
    if (this.progress === 100) {
      this.status = EnrollmentStatus.COMPLETED;
    }
  }

  public markAsCompleted(): void {
    this.status = EnrollmentStatus.COMPLETED;
    this.completedAt = new Date();
  }

  public markAsExpired(): void {
    this.status = EnrollmentStatus.EXPIRED;
    this.expiresAt = new Date();
  }

  public issueCertificate(url: string): void {
    this.certificateUrl = url;
    this.completedAt = new Date();
  }
}