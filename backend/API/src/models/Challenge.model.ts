import { Table, Model, Column, DataType, ForeignKey, BelongsTo, HasOne, HasMany, BelongsToMany } from 'sequelize-typescript';
import User from './User.model';
import Group from './Group.model';
import UserChallenge from './UserChallenge.model';

export enum ChallengeType {
  NO_LOSS = 'no-loss',
  HARDCORE = 'hardcore'
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Table({
  tableName: 'challenges',
  timestamps: true
})
export default class Challenge extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  title!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  language!: string;

  @Column({ type: DataType.ENUM(...Object.values(ChallengeType)) })
  type!: ChallengeType;

  @Column({ type: DataType.INTEGER, allowNull: false })
  stake!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  duration!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  minDailyTime!: number;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  creatorId!: string;

  @BelongsTo(() => User)
  creator!: User;

  @ForeignKey(() => Group)
  @Column({ type: DataType.UUID, allowNull: false })
  groupId!: string;

  @BelongsTo(() => Group)
  group!: Group;

  @Column({ 
    type: DataType.ENUM(...Object.values(ChallengeStatus)),
    defaultValue: ChallengeStatus.ACTIVE
  })
  status!: ChallengeStatus;

  @Column({ type: DataType.DATE, allowNull: false })
  startDate!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  endDate!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  createdAt!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  updatedAt!: Date;

  @BelongsToMany(() => User, () => UserChallenge)
  participants!: User[];
} 