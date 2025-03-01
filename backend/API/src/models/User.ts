import { 
    Model, 
    DataTypes, 
    Optional, 
    HasManyGetAssociationsMixin,
    HasManyAddAssociationMixin,
    HasManyCreateAssociationMixin
  } from 'sequelize';
  import sequelize from '../config/database';
  import bcrypt from 'bcrypt';
  
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
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Attributes for User creation (optional id, createdAt, updatedAt)
  interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'createdAt' | 'updatedAt' | 'isActive'> {}
  
  /**
   * User model for storing user account information
   * Includes authentication methods and profile details
   */
  class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
    public id!: string;
    public email!: string;
    public password!: string;
    public firstName!: string;
    public lastName!: string;
    public role!: UserRole;
    public bio!: string | undefined;
    public profileImage!: string | undefined;
    public isActive!: boolean;
    public lastLogin!: Date | undefined;
  
    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
  
    // Association methods (will be implemented when associations are set up)
    public getEnrollments!: HasManyGetAssociationsMixin<any>;
    public addEnrollment!: HasManyAddAssociationMixin<any, string>;
    public createEnrollment!: HasManyCreateAssociationMixin<any>;
  
    /**
     * Validates a plaintext password against the user's stored hash
     * @param password - The plaintext password to validate
     * @returns True if the password matches, false otherwise
     */
    public async validatePassword(password: string): Promise<boolean> {
      return bcrypt.compare(password, this.password);
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
  
  // Initialize User model with Sequelize
  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        allowNull: false,
        defaultValue: UserRole.STUDENT,
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        // Hash password before saving to database
        beforeCreate: async (user: User) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user: User) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );
  
  export default User;