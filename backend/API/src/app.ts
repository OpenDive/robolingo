import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import winston from 'winston';
import { config, validateEnv } from './config/env';
import sequelize, { testConnection } from './config/database';

// Import API routes
import routes from './routes';

// Import middleware
import { errorHandler, defaultLimiter } from './middleware';

/**
 * Initialize logger
 */
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

/**
 * Create Express application
 */
const app: Application = express();

// Validate environment variables
try {
  validateEnv();
} catch (error) {
  logger.error('Environment validation failed:', error);
  process.exit(1);
}

/**
 * Apply middleware
 */
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use(defaultLimiter);

// Add request logging middleware
app.use((req: Request, _res: Response, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Basic route for testing
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Language Marketplace API is running' });
});

// Mount API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

/**
 * Initialize application
 */
async function initializeApp() {
  try {
    // Test database connection
    await testConnection();
    
    // Sync models with database
    // Note: In production, you'd use migrations instead of sync
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced successfully');
    }
    
    return app;
  } catch (error) {
    logger.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  initializeApp().then(app => {
    const PORT = config.port;
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  });
}

export { initializeApp };
export default app;