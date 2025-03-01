import { Sequelize } from 'sequelize-typescript';
import { config } from './env';
import winston from 'winston';

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
let sequelize: Sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    models: [__dirname + '/../models/*.model.ts'],
  });
} else {
  sequelize = new Sequelize({
    dialect: config.db.dialect as any,
    host: config.db.host,
    port: config.db.port,
    database: config.db.name,
    username: config.db.user,
    password: config.db.password,
    logging: (msg) => logger.debug(msg),
    models: [__dirname + '/../models/*.model.ts'],
  });
}

// Create a global registry for tracking associations
(global as any).__sequelizeAssociations = (global as any).__sequelizeAssociations || {};

// Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    return true;
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
  try {
    // Set a longer timeout for sync operations
    const syncOptions = { 
      force,
      // Add a generous timeout for slower CI environments
      logging: false 
    };
    
    await sequelize.sync(syncOptions);
    logger.info('Database schema synchronized');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};

export default sequelize;