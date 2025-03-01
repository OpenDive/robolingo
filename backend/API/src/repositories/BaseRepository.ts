import { Model, ModelCtor, FindOptions, CreateOptions, UpdateOptions, DestroyOptions, WhereOptions, WhereAttributeHash } from 'sequelize';

/**
 * Generic Repository providing common CRUD operations for any model
 * @template T - Sequelize model type
 * @template K - Primary key type (defaults to string for UUID)
 */
class BaseRepository<T extends Model, K = string> {
  protected model: ModelCtor<T>;

  /**
   * Creates a repository instance for the given model
   * @param model - Sequelize model class
   */
  constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  /**
   * Find all entities matching the provided options
   * @param options - Sequelize find options
   * @returns Promise resolving to an array of model instances
   */
  async findAll(options?: FindOptions): Promise<T[]> {
    return this.model.findAll(options);
  }

  /**
   * Find a single entity by its primary key
   * @param id - Primary key value
   * @param options - Additional find options
   * @returns Promise resolving to the model instance or null if not found
   */
  async findById(id: K, options?: FindOptions): Promise<T | null> {
    return this.model.findByPk(id as string, options);
  }

  /**
   * Find a single entity matching the provided options
   * @param options - Sequelize find options
   * @returns Promise resolving to the model instance or null if not found
   */
  async findOne(options: FindOptions): Promise<T | null> {
    return this.model.findOne(options);
  }

  /**
   * Create a new entity
   * @param data - Entity data
   * @param options - Additional create options
   * @returns Promise resolving to the created model instance
   */
  async create(data: any, options?: CreateOptions): Promise<T> {
    return this.model.create(data, options);
  }

  /**
   * Update an entity by its primary key
   * @param id - Primary key value
   * @param data - Data to update
   * @param options - Additional update options
   * @returns Promise resolving to number of rows affected
   */
  async update(id: K, data: any, options?: UpdateOptions): Promise<[number, T[]]> {
    const mergedOptions = { ...options, returning: true, where: { id } as WhereOptions };
    return this.model.update(data, mergedOptions) as unknown as [number, T[]];
  }

  /**
   * Delete an entity by its primary key
   * @param id - Primary key value
   * @param options - Additional destroy options
   * @returns Promise resolving to number of rows affected
   */
  async delete(id: K, options?: DestroyOptions): Promise<number> {
    const mergedOptions = { ...options, where: { id } as WhereOptions };
    return this.model.destroy(mergedOptions);
  }

  /**
   * Count entities matching the provided criteria
   * @param options - Find options with where clause
   * @returns Promise resolving to count of matching entities
   */
  async count(options?: FindOptions): Promise<number> {
    return this.model.count(options);
  }

  /**
   * Bulk create multiple entities
   * @param data - Array of entity data
   * @param options - Additional bulk create options
   * @returns Promise resolving to array of created model instances
   */
  async bulkCreate(data: any[], options?: CreateOptions): Promise<T[]> {
    return this.model.bulkCreate(data, options);
  }

  /**
   * Bulk update entities matching criteria
   * @param data - Data to update
   * @param options - Update options with where clause
   * @returns Promise resolving to number of rows affected
   */
  async bulkUpdate(data: any, options: UpdateOptions): Promise<[number, T[]]> {
    const mergedOptions = { ...options, returning: true };
    return this.model.update(data, mergedOptions) as unknown as [number, T[]];
  }

  /**
   * Bulk delete entities matching criteria
   * @param options - Destroy options with where clause
   * @returns Promise resolving to number of rows affected
   */
  async bulkDelete(options: DestroyOptions): Promise<number> {
    return this.model.destroy(options);
  }
}

export default BaseRepository;