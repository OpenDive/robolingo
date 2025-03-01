import { Table, Model, Column, DataType, BelongsToMany, HasMany, ForeignKey } from 'sequelize-typescript';
import User from './User.model';
import UserGroup from './UserGroup.model';
import { BelongsToManyAddAssociationsMixin } from 'sequelize';
import Message from './Message.model';

@Table({
  tableName: 'groups',
  timestamps: true
})
export default class Group extends Model {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: DataType.UUIDV4
  })
  id!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  language!: string;

  @Column({ type: DataType.UUID, allowNull: false })
  creatorId!: string;

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  ethPool!: number;

  @Column({ type: DataType.STRING })
  avatar!: string;

  declare addMembers: BelongsToManyAddAssociationsMixin<User, string>;

  @BelongsToMany(() => User, () => UserGroup)
  members!: User[];

  @HasMany(() => Message)
  messages!: Message[];
} 