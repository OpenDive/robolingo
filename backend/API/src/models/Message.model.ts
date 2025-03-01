import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import User from './User.model';
import Group from './Group.model';

@Table({
  tableName: 'messages',
  timestamps: true
})
export default class Message extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @ForeignKey(() => Group)
  @Column(DataType.UUID)
  groupId!: string;

  @Column(DataType.TEXT)
  content!: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Group)
  group!: Group;

  @Column(DataType.DATE)
  createdAt!: Date;

  @Column(DataType.DATE)
  updatedAt!: Date;
}