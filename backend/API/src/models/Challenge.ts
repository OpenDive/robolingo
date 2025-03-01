import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database';

export enum ChallengeType {
  NO_LOSS = 'no-loss',
  HARDCORE = 'hardcore'
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

interface ChallengeAttributes {
  id: string;
  title: string;
  language: string;
  type: ChallengeType;
  stake: number;
  duration: number;
  minDailyTime: number;
  creatorId: string;
  groupId: string;
  status: ChallengeStatus;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ChallengeCreationAttributes extends Optional<ChallengeAttributes, 'id' | 'createdAt' | 'updatedAt' | 'status'> {}

class Challenge extends Model<ChallengeAttributes, ChallengeCreationAttributes> implements ChallengeAttributes {
  public id!: string;
  public title!: string;
  public language!: string;
  public type!: ChallengeType;
  public stake!: number;
  public duration!: number;
  public minDailyTime!: number;
  public creatorId!: string;
  public groupId!: string;
  public status!: ChallengeStatus;
  public startDate!: Date;
  public endDate!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Challenge.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    language: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM(...Object.values(ChallengeType)),
      allowNull: false
    },
    stake: {
      type: DataTypes.DECIMAL(10, 18), // For ETH values
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    minDailyTime: {
      type: DataTypes.INTEGER,
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
    groupId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'groups',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(...Object.values(ChallengeStatus)),
      defaultValue: ChallengeStatus.ACTIVE
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATE,
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
    modelName: 'Challenge',
    tableName: 'challenges'
  }
);

export { Challenge }; 