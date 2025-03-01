import { Model } from 'sequelize';
import BaseRepository from '../repositories/BaseRepository';

/**
 * Base service class providing generic CRUD operations
 * Serves as a foundation for specialized domain services
 * 
 * @template T - Sequelize model type
 * @template R - Repository type extending BaseRepository
 */
class BaseService<T extends Model, R extends BaseRepository<T>> {
  protected repository: R;

  /**
   * Creates a service with the provided repository
   * @param repository - Repository instance for data access
   */
  constructor(repository: R) {
    this.repository = repository;
  }

  /**
   * Retrieve all entities
   * @param options - Optional query parameters
   * @returns Promise resolving to array of entities
   */
  async findAll(options?: any): Promise<T[]> {
    return this.repository.findAll(options);
  }

  /**
   * Find entity by ID
   * @param id - Entity ID
   * @param options - Optional query parameters
   * @returns Promise resolving to entity or null if not found
   */
  async findById(id: string, options?: any): Promise<T | null> {
    return this.repository.findById(id, options);
  }

  /**
   * Find single entity matching criteria
   * @param options - Query parameters
   * @returns Promise resolving to entity or null if not found
   */
  async findOne(options: any): Promise<T | null> {
    return this.repository.findOne(options);
  }

  /**
   * Create new entity
   * @param data - Entity data
   * @returns Promise resolving to created entity
   */
  async create(data: any): Promise<T> {
    return this.repository.create(data);
  }

  /**
   * Update existing entity by ID
   * @param id - Entity ID
   * @param data - Updated entity data
   * @returns Promise resolving to updated entity or null if not found
   */
  async update(id: string, data: any): Promise<T | null> {
    const [affectedCount, affectedRows] = await this.repository.update(id, data);
    
    if (affectedCount === 0) {
      return null;
    }
    
    return affectedRows[0];
  }

  /**
   * Delete entity by ID
   * @param id - Entity ID
   * @returns Promise resolving to boolean indicating success
   */
  async delete(id: string): Promise<boolean> {
    const affectedCount = await this.repository.delete(id);
    return affectedCount > 0;
  }
}

export default BaseService;