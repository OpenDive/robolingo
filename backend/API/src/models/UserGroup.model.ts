import { Table, Model, Column, DataType, ForeignKey } from 'sequelize-typescript';
import User from './User.model';
import Group from './Group.model';

@Table({ tableName: 'user_groups' })
export default class UserGroup extends Model {
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  userId!: string;

  @ForeignKey(() => Group)
  @Column({ type: DataType.UUID, allowNull: false })
  groupId!: string;
} 