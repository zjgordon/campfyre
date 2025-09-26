import { PrismaClient, Campaign, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * Campaign repository for campaign-related database operations
 * Extends BaseRepository with campaign-specific methods
 */
export class CampaignRepository extends BaseRepository<
  Campaign,
  Prisma.CampaignCreateInput,
  Prisma.CampaignUpdateInput,
  Prisma.CampaignWhereInput,
  Prisma.CampaignWhereUniqueInput
> {
  constructor() {
    super(new PrismaClient().campaign);
  }

  /**
   * Find campaign by ID with all related data
   */
  async findByIdWithRelations(id: string): Promise<Campaign | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          owner: true,
          gameSystem: true,
          members: {
            include: {
              user: true,
            },
          },
          characters: {
            include: {
              owner: true,
            },
          },
          gameSessions: {
            include: {
              gm: true,
            },
            orderBy: {
              scheduledAt: 'desc',
            },
          },
        },
      });
    } catch (error) {
      this.handleError('findByIdWithRelations', error);
      throw error;
    }
  }

  /**
   * Find campaigns by owner
   */
  async findByOwner(ownerId: string): Promise<Campaign[]> {
    return this.findMany(
      { ownerId },
      {
        orderBy: { createdAt: 'desc' },
        include: {
          gameSystem: true,
          _count: {
            select: {
              members: true,
              characters: true,
              gameSessions: true,
            },
          },
        },
      }
    );
  }

  /**
   * Find active campaigns
   */
  async findActive(): Promise<Campaign[]> {
    return this.findMany(
      { status: 'ACTIVE' },
      {
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          gameSystem: true,
          _count: {
            select: {
              members: true,
              characters: true,
            },
          },
        },
      }
    );
  }

  /**
   * Find public campaigns
   */
  async findPublic(): Promise<Campaign[]> {
    return this.findMany(
      {
        visibility: 'PUBLIC',
        status: 'ACTIVE',
      },
      {
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          gameSystem: true,
          _count: {
            select: {
              members: true,
              characters: true,
            },
          },
        },
      }
    );
  }

  /**
   * Find campaigns by game system
   */
  async findByGameSystem(gameSystemId: string): Promise<Campaign[]> {
    return this.findMany(
      { gameSystemId },
      {
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          gameSystem: true,
        },
      }
    );
  }

  /**
   * Search campaigns by name or description
   */
  async search(query: string): Promise<Campaign[]> {
    return this.findMany(
      {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
        status: 'ACTIVE',
      },
      {
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          gameSystem: true,
        },
      }
    );
  }

  /**
   * Find campaigns with available slots
   */
  async findWithAvailableSlots(): Promise<Campaign[]> {
    return this.findMany(
      {
        status: 'ACTIVE',
        visibility: 'PUBLIC',
      },
      {
        orderBy: { createdAt: 'desc' },
        include: {
          owner: true,
          gameSystem: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      }
    );
  }

  /**
   * Update campaign player count
   */
  async updatePlayerCount(id: string): Promise<Campaign> {
    try {
      const memberCount = await this.model.count({
        where: {
          id,
          members: {
            some: {
              isActive: true,
            },
          },
        },
      });

      return this.update(
        { id },
        {
          currentPlayers: memberCount,
        }
      );
    } catch (error) {
      this.handleError('updatePlayerCount', error);
      throw error;
    }
  }

  /**
   * Change campaign status
   */
  async changeStatus(
    id: string,
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  ): Promise<Campaign> {
    return this.update(
      { id },
      {
        status,
      }
    );
  }

  /**
   * Change campaign visibility
   */
  async changeVisibility(
    id: string,
    visibility: 'PRIVATE' | 'PUBLIC' | 'UNLISTED'
  ): Promise<Campaign> {
    return this.update(
      { id },
      {
        visibility,
      }
    );
  }

  /**
   * Get campaign statistics
   */
  async getCampaignStats(id: string): Promise<{
    memberCount: number;
    characterCount: number;
    sessionCount: number;
    messageCount: number;
  }> {
    try {
      const [memberCount, characterCount, sessionCount, messageCount] =
        await Promise.all([
          this.model.count({
            where: {
              id,
              members: {
                some: {
                  isActive: true,
                },
              },
            },
          }),
          this.model.count({
            where: {
              id,
              characters: {
                some: {
                  isActive: true,
                },
              },
            },
          }),
          this.model.count({
            where: {
              id,
              gameSessions: {
                some: {},
              },
            },
          }),
          this.model.count({
            where: {
              id,
              gameSessions: {
                some: {
                  messages: {
                    some: {},
                  },
                },
              },
            },
          }),
        ]);

      return {
        memberCount,
        characterCount,
        sessionCount,
        messageCount,
      };
    } catch (error) {
      this.handleError('getCampaignStats', error);
      throw error;
    }
  }

  /**
   * Find campaigns with pagination and filters
   */
  async findWithFilters(
    filters?: {
      status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
      visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
      gameSystemId?: string;
      ownerId?: string;
      searchQuery?: string;
    },
    options?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: Campaign[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: Prisma.CampaignWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.visibility) {
      where.visibility = filters.visibility;
    }

    if (filters?.gameSystemId) {
      where.gameSystemId = filters.gameSystemId;
    }

    if (filters?.ownerId) {
      where.ownerId = filters.ownerId;
    }

    if (filters?.searchQuery) {
      where.OR = [
        {
          name: {
            contains: filters.searchQuery,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: filters.searchQuery,
            mode: 'insensitive',
          },
        },
      ];
    }

    const paginationOptions: {
      page?: number;
      limit?: number;
      orderBy?: any;
      include?: any;
    } = {};

    if (options?.page !== undefined) {
      paginationOptions.page = options.page;
    }
    if (options?.limit !== undefined) {
      paginationOptions.limit = options.limit;
    }
    paginationOptions.orderBy = { createdAt: 'desc' };
    paginationOptions.include = {
      owner: true,
      gameSystem: true,
      _count: {
        select: {
          members: true,
          characters: true,
          gameSessions: true,
        },
      },
    };

    return this.findWithPagination(where, paginationOptions);
  }

  /**
   * Get campaigns by user membership
   */
  async findByUserMembership(userId: string): Promise<Campaign[]> {
    try {
      return await this.model.findMany({
        where: {
          members: {
            some: {
              userId,
              isActive: true,
            },
          },
        },
        include: {
          owner: true,
          gameSystem: true,
          members: {
            where: {
              userId,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      this.handleError('findByUserMembership', error);
      throw error;
    }
  }

  /**
   * Archive old completed campaigns
   */
  async archiveOldCampaigns(daysOld: number = 365): Promise<{ count: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.updateMany(
      {
        status: 'COMPLETED',
        updatedAt: {
          lt: cutoffDate,
        },
      },
      {
        visibility: 'PRIVATE',
      }
    );
  }
}
