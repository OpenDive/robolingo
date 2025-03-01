import { Table, Model, Column, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './User.model';
import Challenge from './Challenge.model';

@Table({ tableName: 'user_challenges', timestamps: false })
export default class UserChallenge extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, primaryKey: true })
  userId!: string;

  @ForeignKey(() => Challenge)
  @Column({ type: DataType.UUID, primaryKey: true })
  challengeId!: string;

  @Column({ 
    type: DataType.ENUM('invited', 'joined', 'left'),
    defaultValue: 'joined'
  })
  status!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Challenge)
  challenge!: Challenge;
} 