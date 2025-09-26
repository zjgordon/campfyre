import { PrismaClient, User, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * User repository for user-related database operations
 * Extends BaseRepository with user-specific methods
 */
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereInput,
  Prisma.UserWhereUniqueInput
> {
  constructor() {
    super(new PrismaClient().user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.findUnique({ email });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.findUnique({ username });
  }

  /**
   * Find user by ID with related data
   */
  async findByIdWithRelations(id: string): Promise<User | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          ownedCampaigns: {
            include: {
              gameSystem: true,
            },
          },
          campaignMemberships: {
            include: {
              campaign: {
                include: {
                  owner: true,
                  gameSystem: true,
                },
              },
            },
          },
          characters: {
            include: {
              campaign: true,
            },
          },
          sessions: true,
          gameSessions: {
            include: {
              campaign: true,
            },
          },
          messages: true,
          notifications: true,
        },
      });
    } catch (error) {
      this.handleError('findByIdWithRelations', error);
      throw error;
    }
  }

  /**
   * Find active users
   */
  async findActiveUsers(): Promise<User[]> {
    return this.findMany({
      isActive: true,
    });
  }

  /**
   * Find users by last login date
   */
  async findByLastLoginAfter(date: Date): Promise<User[]> {
    return this.findMany({
      lastLoginAt: {
        gte: date,
      },
    });
  }

  /**
   * Update user's last login time
   */
  async updateLastLogin(id: string): Promise<User> {
    return this.update(
      { id },
      {
        lastLoginAt: new Date(),
      }
    );
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string): Promise<User> {
    return this.update(
      { id },
      {
        isActive: false,
      }
    );
  }

  /**
   * Activate user account
   */
  async activate(id: string): Promise<User> {
    return this.update(
      { id },
      {
        isActive: true,
      }
    );
  }

  /**
   * Search users by name or username
   */
  async search(query: string): Promise<User[]> {
    return this.findMany({
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          username: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats(id: string): Promise<{
    campaignCount: number;
    characterCount: number;
    sessionCount: number;
    messageCount: number;
  }> {
    try {
      const [campaignCount, characterCount, sessionCount, messageCount] =
        await Promise.all([
          this.model.count({
            where: {
              ownedCampaigns: {
                some: {
                  ownerId: id,
                },
              },
            },
          }),
          this.model.count({
            where: {
              characters: {
                some: {
                  ownerId: id,
                },
              },
            },
          }),
          this.model.count({
            where: {
              gameSessions: {
                some: {
                  gmId: id,
                },
              },
            },
          }),
          this.model.count({
            where: {
              messages: {
                some: {
                  authorId: id,
                },
              },
            },
          }),
        ]);

      return {
        campaignCount,
        characterCount,
        sessionCount,
        messageCount,
      };
    } catch (error) {
      this.handleError('getUserStats', error);
      throw error;
    }
  }

  /**
   * Find users with pagination and search
   */
  async findWithSearch(
    searchQuery?: string,
    options?: {
      page?: number;
      limit?: number;
      isActive?: boolean;
    }
  ): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: Prisma.UserWhereInput = {};

    if (searchQuery) {
      where.OR = [
        {
          name: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          username: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (options?.isActive !== undefined) {
      where.isActive = options.isActive;
    }

    const paginationOptions: {
      page?: number;
      limit?: number;
      orderBy?: any;
    } = {};

    if (options?.page !== undefined) {
      paginationOptions.page = options.page;
    }
    if (options?.limit !== undefined) {
      paginationOptions.limit = options.limit;
    }
    paginationOptions.orderBy = { createdAt: 'desc' };

    return this.findWithPagination(where, paginationOptions);
  }

  /**
   * Bulk update user preferences
   */
  async updatePreferences(
    userIds: string[],
    preferences: any
  ): Promise<{ count: number }> {
    return this.updateMany(
      {
        id: {
          in: userIds,
        },
      },
      {
        preferences,
      }
    );
  }

  /**
   * Get users by campaign membership
   */
  async findByCampaignMembership(campaignId: string): Promise<User[]> {
    try {
      return await this.model.findMany({
        where: {
          campaignMemberships: {
            some: {
              campaignId,
              isActive: true,
            },
          },
        },
        include: {
          campaignMemberships: {
            where: {
              campaignId,
            },
          },
        },
      });
    } catch (error) {
      this.handleError('findByCampaignMembership', error);
      throw error;
    }
  }
}
