import { Sequelize } from 'sequelize-typescript';
import User from '../models/User.model';
import Course from '../models/Course.model';
import Challenge from '../models/Challenge.model';
import Lecture from '../models/Lecture.model';
import Quiz from '../models/Quiz.model';
import Question from '../models/Question.model';
import Enrollment from '../models/Enrollment.model';
import Progress from '../models/Progress.model';
import Group from '../models/Group.model';
import UserChallenge from '../models/UserChallenge.model';
import Message from '../models/Message.model';
import UserGroup from '../models/UserGroup.model';

/**
 * Create a test database connection
 * This creates a new Sequelize instance specifically for tests
 * to avoid connection sharing issues
 */
export const createTestDatabase = () => {
  return new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [
      User,
      Course,
      Challenge,
      Lecture, 
      Quiz,
      Question,
      Enrollment,
      Progress,
      Group,
      UserChallenge,
      Message,
      UserGroup
    ],
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    },
    // SQLite specific options for handling JSON fields
    dialectOptions: {
      // SQLite needs special handling for JSON/array fields
      typeValidation: true
    }
  });
};

/**
 * Utility function to setup and sync test database
 */
export const setupTestDb = async () => {
  const sequelize = createTestDatabase();
  
  try {
    // Sync database with force: true to create fresh tables
    await sequelize.sync({ force: true });
    return sequelize;
  } catch (error) {
    // Close connection on sync error to avoid hanging connections
    await sequelize.close();
    throw error;
  }
}; 