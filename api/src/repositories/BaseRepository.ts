import { PrismaClient } from '@prisma/client';
import { getPrismaClient } from '../config/database';

/**
 * Base repository class providing common CRUD operations
 * Implements the Repository pattern for clean data access layer
 */
export abstract class BaseRepository<
  T,
  CreateInput,
  UpdateInput,
  WhereInput,
  WhereUniqueInput,
> {
  protected client: PrismaClient;
  protected model: any;

  constructor(model: any) {
    this.client = getPrismaClient();
    this.model = model;
  }

  /**
   * Create a new record
   */
  async create(data: CreateInput): Promise<T> {
    try {
      return await this.model.create({
        data,
      });
    } catch (error) {
      this.handleError('create', error);
      throw error;
    }
  }

  /**
   * Create multiple records
   */
  async createMany(data: CreateInput[]): Promise<{ count: number }> {
    try {
      return await this.model.createMany({
        data,
      });
    } catch (error) {
      this.handleError('createMany', error);
      throw error;
    }
  }

  /**
   * Find a record by unique identifier
   */
  async findUnique(where: WhereUniqueInput): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where,
      });
    } catch (error) {
      this.handleError('findUnique', error);
      throw error;
    }
  }

  /**
   * Find the first record matching criteria
   */
  async findFirst(where: WhereInput): Promise<T | null> {
    try {
      return await this.model.findFirst({
        where,
      });
    } catch (error) {
      this.handleError('findFirst', error);
      throw error;
    }
  }

  /**
   * Find multiple records
   */
  async findMany(
    where?: WhereInput,
    options?: {
      skip?: number;
      take?: number;
      orderBy?: any;
      include?: any;
    }
  ): Promise<T[]> {
    try {
      return await this.model.findMany({
        where,
        ...options,
      });
    } catch (error) {
      this.handleError('findMany', error);
      throw error;
    }
  }

  /**
   * Count records matching criteria
   */
  async count(where?: WhereInput): Promise<number> {
    try {
      return await this.model.count({
        where,
      });
    } catch (error) {
      this.handleError('count', error);
      throw error;
    }
  }

  /**
   * Update a record by unique identifier
   */
  async update(where: WhereUniqueInput, data: UpdateInput): Promise<T> {
    try {
      return await this.model.update({
        where,
        data,
      });
    } catch (error) {
      this.handleError('update', error);
      throw error;
    }
  }

  /**
   * Update multiple records
   */
  async updateMany(
    where: WhereInput,
    data: UpdateInput
  ): Promise<{ count: number }> {
    try {
      return await this.model.updateMany({
        where,
        data,
      });
    } catch (error) {
      this.handleError('updateMany', error);
      throw error;
    }
  }

  /**
   * Upsert a record (create or update)
   */
  async upsert(
    where: WhereUniqueInput,
    create: CreateInput,
    update: UpdateInput
  ): Promise<T> {
    try {
      return await this.model.upsert({
        where,
        create,
        update,
      });
    } catch (error) {
      this.handleError('upsert', error);
      throw error;
    }
  }

  /**
   * Delete a record by unique identifier
   */
  async delete(where: WhereUniqueInput): Promise<T> {
    try {
      return await this.model.delete({
        where,
      });
    } catch (error) {
      this.handleError('delete', error);
      throw error;
    }
  }

  /**
   * Delete multiple records
   */
  async deleteMany(where: WhereInput): Promise<{ count: number }> {
    try {
      return await this.model.deleteMany({
        where,
      });
    } catch (error) {
      this.handleError('deleteMany', error);
      throw error;
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<T>(
    fn: (
      tx: Omit<
        PrismaClient,
        | '$connect'
        | '$disconnect'
        | '$on'
        | '$transaction'
        | '$use'
        | '$extends'
      >
    ) => Promise<T>
  ): Promise<T> {
    try {
      return await this.client.$transaction(fn);
    } catch (error) {
      this.handleError('transaction', error);
      throw error;
    }
  }

  /**
   * Execute a raw query
   */
  async rawQuery<T = any>(query: string, ...params: any[]): Promise<T> {
    try {
      return await this.client.$queryRawUnsafe(query, ...params);
    } catch (error) {
      this.handleError('rawQuery', error);
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  async exists(where: WhereInput): Promise<boolean> {
    try {
      const count = await this.count(where);
      return count > 0;
    } catch (error) {
      this.handleError('exists', error);
      throw error;
    }
  }

  /**
   * Find records with pagination
   */
  async findWithPagination(
    where?: WhereInput,
    options?: {
      page?: number;
      limit?: number;
      orderBy?: any;
      include?: any;
    }
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.findMany(where, {
          skip,
          take: limit,
          orderBy: options?.orderBy,
          include: options?.include,
        }),
        this.count(where),
      ]);

      return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.handleError('findWithPagination', error);
      throw error;
    }
  }

  /**
   * Handle database errors with proper logging
   */
  protected handleError(operation: string, error: any): void {
    console.error(`Database error in ${this.constructor.name}.${operation}:`, {
      error: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack,
    });

    // You can add more sophisticated error handling here
    // such as error categorization, retry logic, etc.
  }

  /**
   * Get the Prisma client instance
   */
  getClient(): PrismaClient {
    return this.client;
  }
}
