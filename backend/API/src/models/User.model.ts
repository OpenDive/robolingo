import {
  Table,
  Column,
  Model,
  DataType,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  BelongsTo,
  ForeignKey,
  BelongsToMany
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import Course from './Course.model';
import Challenge from './Challenge.model';
import Enrollment from './Enrollment.model';
import UserChallenge from './UserChallenge.model';

// Roles enum for user types
export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin'
}

// User attributes interface
interface UserAttributes {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  bio?: string;
  profileImage?: string;
  isActive: boolean;
  lastLogin?: Date;
  walletAddress?: string;
  friends: string[];
  currentChallengeId?: string;
  dailyProgress: Record<string, number>;
  streak: number;
  deletedAt?: Date;
}

// Attributes for User creation (optional id, createdAt, updatedAt)
interface UserCreationAttributes extends Partial<UserAttributes> {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
}

/**
 * User model for storing user account information
 * Includes authentication methods and profile details
 */
@Table({
  tableName: 'users',
  timestamps: true,
  paranoid: true
})
export default class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: () => uuidv4()
  })
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false
  })
  password!: string;

  @Column({
    type: DataType.STRING
  })
  firstName!: string;

  @Column({
    type: DataType.STRING
  })
  lastName!: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.STUDENT
  })
  role!: UserRole;

  @Column({
    type: DataType.TEXT
  })
  bio?: string;

  @Column({
    type: DataType.STRING
  })
  profileImage?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  isActive!: boolean;

  @Column({
    type: DataType.DATE
  })
  lastLogin?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    unique: true,
    defaultValue: null
  })
  walletAddress?: string;

  // For SQLite compatibility, store arrays as JSON strings
  @Column({
    type: DataType.TEXT,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('friends');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('friends', JSON.stringify(value || []));
    }
  })
  friends!: string[];

  @ForeignKey(() => Challenge)
  @Column({
    type: DataType.UUID
  })
  currentChallengeId?: string;

  @BelongsTo(() => Challenge, 'currentChallengeId')
  currentChallenge?: Challenge;

  // For SQLite compatibility, store JSON as text
  @Column({
    type: DataType.TEXT,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('dailyProgress');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('dailyProgress', JSON.stringify(value || {}));
    }
  })
  dailyProgress!: Record<string, number>;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  streak!: number;

  @Column(DataType.DATE)
  deletedAt?: Date;

  @HasMany(() => Course, 'instructorId')
  createdCourses!: Course[];

  @HasMany(() => Enrollment)
  enrollments!: Enrollment[];

  @BelongsToMany(() => Challenge, () => UserChallenge)
  challenges!: Challenge[];

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Hash password before create
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  // Method to compare passwords
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  /**
   * Get the full name of the user
   * @returns The combined first and last name
   */
  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Checks if the user has a specific role
   * @param role - The role to check
   * @returns True if the user has the role, false otherwise
   */
  public hasRole(role: UserRole): boolean {
    return this.role === role;
  }
}