import { Sequelize } from 'sequelize-typescript';
import { config } from './env';
import winston from 'winston';
import {
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
} from '../models/index';

// Configure logger
const logger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Determine database dialect based on environment
const getDialect = () => {
  if (process.env.DB_DIALECT) {
    return process.env.DB_DIALECT;
  }
  return process.env.NODE_ENV === 'test' ? 'sqlite' : 'postgres';
};

// Get database storage location for SQLite
const getStorage = () => {
  if (process.env.DB_STORAGE) {
    return process.env.DB_STORAGE;
  }
  return process.env.NODE_ENV === 'test' ? ':memory:' : undefined;
};

// Configure database connection based on environment
const sequelize = new Sequelize({
  dialect: getDialect() as 'sqlite' | 'postgres' | 'mysql',
  storage: getStorage(),
  host: process.env.NODE_ENV === 'test' ? undefined : config.db.host,
  port: process.env.NODE_ENV === 'test' ? undefined : config.db.port,
  database: process.env.NODE_ENV === 'test' ? undefined : config.db.name,
  username: process.env.NODE_ENV === 'test' ? undefined : config.db.user,
  password: process.env.NODE_ENV === 'test' ? undefined : config.db.password,
  logging: process.env.NODE_ENV === 'test' ? false : (msg) => logger.debug(msg),
  // Add models
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
  // SQLite-specific options
  ...(process.env.NODE_ENV === 'test' && {
    dialectOptions: {
      // SQLite needs special handling for JSON/array fields
      typeValidation: true
    }
  })
});

// Separate connection test from schema sync
export const testConnection = async (): Promise<void> => {
  try {
    // Only test connection in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      await sequelize.authenticate();
      logger.info('Database connection established successfully');
    } else {
      // For test environment, just log success
      logger.info('Test database configured successfully');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    // Don't exit in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

// Explicit sync function for development/test environments
export const syncDatabase = async (force = false): Promise<void> => {
  if (process.env.NODE_ENV === 'production' && force !== true) {
    logger.warn('Database sync skipped in production environment');
    return;
  }
  
  try {
    await sequelize.sync({ 
      force: force || process.env.NODE_ENV === 'test',
      logging: process.env.NODE_ENV !== 'test'
    });
    logger.info('Database schema synchronized');
  } catch (error) {
    logger.error('Database sync failed:', error);
    // Don't exit in test environment
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

export default sequelize;