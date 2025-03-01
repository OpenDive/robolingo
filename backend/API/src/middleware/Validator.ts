import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ApiError } from './ErrorHandler';

/**
 * Middleware to validate request data using express-validator
 * @param validations - Array of express-validator validation chains
 * @returns Express middleware function
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Execute all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    // Check for validation errors
    const errors = validationResult(req);
    
    if (errors.isEmpty()) {
      return next();
    }

    // Format validation errors
    const formattedErrors = errors.array().map(error => ({
      field: (error as any).param,
      message: (error as any).msg,
      value: (error as any).value
    }));
    
    // Throw API error with validation details
    res.status(400).json({
      error: 'Validation Error',
      details: formattedErrors
    });
  };
};