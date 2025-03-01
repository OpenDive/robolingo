import { Request, Response, NextFunction } from 'express';
import { BaseService } from '../services';

/**
 * Base controller providing common CRUD operations for API endpoints
 * Serves as a foundation for resource-specific controllers
 */
abstract class BaseController<T> {
  protected service: BaseService<any, any>;
  
  /**
   * Creates a controller with the provided service
   * @param service - Service instance for data operations
   */
  constructor(service: BaseService<any, any>) {
    this.service = service;
  }

  /**
   * Get all resources
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const items = await this.service.findAll();
      res.json(items);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a resource by ID
   * @param req - Express request object (with id parameter)
   * @param res - Express response object
   * @param next - Express next function
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const item = await this.service.findById(id);
      
      if (!item) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }
      
      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new resource
   * @param req - Express request object (with resource data in body)
   * @param res - Express response object
   * @param next - Express next function
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.service.create(req.body);
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing resource
   * @param req - Express request object (with id parameter and update data in body)
   * @param res - Express response object
   * @param next - Express next function
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const item = await this.service.update(id, req.body);
      
      if (!item) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }
      
      res.json(item);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a resource
   * @param req - Express request object (with id parameter)
   * @param res - Express response object
   * @param next - Express next function
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      const success = await this.service.delete(id);
      
      if (!success) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export default BaseController;