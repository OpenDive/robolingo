import { Model, DataTypes, Optional, BelongsToManyAddAssociationsMixin } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

interface GroupAttributes {
  id: string;
  name: string;
  language: string;
  creatorId: string;
  ethPool: number;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
}

interface GroupCreationAttributes extends Optional<GroupAttributes, 'id' | 'createdAt' | 'updatedAt' | 'ethPool'> {}

class Group extends Model<GroupAttributes, GroupCreationAttributes> implements GroupAttributes {
  public id!: string;
  public name!: string;
  public language!: string;
  public creatorId!: string;
  public ethPool!: number;
  public avatar!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public addMembers!: BelongsToManyAddAssociationsMixin<User, string>;
}

Group.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    ethPool: {
      type: DataTypes.DECIMAL(10, 18),
      defaultValue: 0
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'Group',
    tableName: 'groups'
  }
);

export { Group }; 