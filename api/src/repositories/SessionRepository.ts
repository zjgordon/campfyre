import { PrismaClient, GameSession, Prisma } from '@prisma/client';
import { BaseRepository } from './BaseRepository';

/**
 * Game Session repository for session-related database operations
 * Extends BaseRepository with session-specific methods
 */
export class SessionRepository extends BaseRepository<
  GameSession,
  Prisma.GameSessionCreateInput,
  Prisma.GameSessionUpdateInput,
  Prisma.GameSessionWhereInput,
  Prisma.GameSessionWhereUniqueInput
> {
  constructor() {
    super(new PrismaClient().gameSession);
  }

  /**
   * Find session by ID with all related data
   */
  async findByIdWithRelations(id: string): Promise<GameSession | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        include: {
          campaign: {
            include: {
              owner: true,
              gameSystem: true,
            },
          },
          gm: true,
          characters: {
            include: {
              character: {
                include: {
                  owner: true,
                },
              },
            },
          },
          messages: {
            include: {
              author: true,
            },
            orderBy: {
              createdAt: 'asc',
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
   * Find sessions by campaign
   */
  async findByCampaign(campaignId: string): Promise<GameSession[]> {
    return this.findMany(
      { campaignId },
      {
        orderBy: { scheduledAt: 'desc' },
        include: {
          gm: true,
          _count: {
            select: {
              characters: true,
              messages: true,
            },
          },
        },
      }
    );
  }

  /**
   * Find sessions by GM
   */
  async findByGM(gmId: string): Promise<GameSession[]> {
    return this.findMany(
      { gmId },
      {
        orderBy: { scheduledAt: 'desc' },
        include: {
          campaign: {
            include: {
              gameSystem: true,
            },
          },
        },
      }
    );
  }

  /**
   * Find upcoming sessions
   */
  async findUpcoming(limit: number = 10): Promise<GameSession[]> {
    return this.findMany(
      {
        status: 'PLANNED',
        scheduledAt: {
          gte: new Date(),
        },
      },
      {
        take: limit,
        orderBy: { scheduledAt: 'asc' },
        include: {
          campaign: {
            include: {
              owner: true,
              gameSystem: true,
            },
          },
          gm: true,
        },
      }
    );
  }

  /**
   * Find sessions by status
   */
  async findByStatus(
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  ): Promise<GameSession[]> {
    return this.findMany(
      { status },
      {
        orderBy: { scheduledAt: 'desc' },
        include: {
          campaign: {
            include: {
              owner: true,
              gameSystem: true,
            },
          },
          gm: true,
        },
      }
    );
  }

  /**
   * Find sessions in date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<GameSession[]> {
    return this.findMany(
      {
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      {
        orderBy: { scheduledAt: 'asc' },
        include: {
          campaign: {
            include: {
              owner: true,
              gameSystem: true,
            },
          },
          gm: true,
        },
      }
    );
  }

  /**
   * Start a session
   */
  async startSession(id: string): Promise<GameSession> {
    return this.update(
      { id },
      {
        status: 'IN_PROGRESS',
        startedAt: new Date(),
      }
    );
  }

  /**
   * End a session
   */
  async endSession(id: string): Promise<GameSession> {
    return this.update(
      { id },
      {
        status: 'COMPLETED',
        endedAt: new Date(),
      }
    );
  }

  /**
   * Cancel a session
   */
  async cancelSession(id: string, reason?: string): Promise<GameSession> {
    const updateData: Prisma.GameSessionUpdateInput = {
      status: 'CANCELLED',
    };

    if (reason) {
      const existingNotes = await this.getExistingNotes(id);
      updateData.notes = `${existingNotes} - Cancelled: ${reason}`;
    }

    return this.update({ id }, updateData);
  }

  /**
   * Reschedule a session
   */
  async rescheduleSession(id: string, newDate: Date): Promise<GameSession> {
    return this.update(
      { id },
      {
        scheduledAt: newDate,
        status: 'PLANNED',
      }
    );
  }

  /**
   * Add character to session
   */
  async addCharacter(
    sessionId: string,
    characterId: string,
    isPresent: boolean = true,
    notes?: string
  ): Promise<void> {
    try {
      const createData: Prisma.GameSessionCharacterCreateInput = {
        gameSession: {
          connect: { id: sessionId },
        },
        character: {
          connect: { id: characterId },
        },
        isPresent,
      };

      if (notes) {
        createData.notes = notes;
      }

      await this.client.gameSessionCharacter.create({
        data: createData,
      });
    } catch (error) {
      this.handleError('addCharacter', error);
      throw error;
    }
  }

  /**
   * Remove character from session
   */
  async removeCharacter(sessionId: string, characterId: string): Promise<void> {
    try {
      await this.client.gameSessionCharacter.delete({
        where: {
          gameSessionId_characterId: {
            gameSessionId: sessionId,
            characterId,
          },
        },
      });
    } catch (error) {
      this.handleError('removeCharacter', error);
      throw error;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(id: string): Promise<{
    characterCount: number;
    messageCount: number;
    duration?: number; // in minutes
  }> {
    try {
      const session = await this.findByIdWithRelations(id);
      if (!session) {
        throw new Error('Session not found');
      }

      const characterCount = (session as any).characters?.length || 0;
      const messageCount = (session as any).messages?.length || 0;

      let duration: number | undefined;
      if (session.startedAt && session.endedAt) {
        duration = Math.round(
          (session.endedAt.getTime() - session.startedAt.getTime()) /
            (1000 * 60)
        );
      }

      const result: {
        characterCount: number;
        messageCount: number;
        duration?: number;
      } = {
        characterCount,
        messageCount,
      };

      if (duration !== undefined) {
        result.duration = duration;
      }

      return result;
    } catch (error) {
      this.handleError('getSessionStats', error);
      throw error;
    }
  }

  /**
   * Find sessions with pagination and filters
   */
  async findWithFilters(
    filters?: {
      campaignId?: string;
      gmId?: string;
      status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      startDate?: Date;
      endDate?: Date;
    },
    options?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: GameSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: Prisma.GameSessionWhereInput = {};

    if (filters?.campaignId) {
      where.campaignId = filters.campaignId;
    }

    if (filters?.gmId) {
      where.gmId = filters.gmId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.scheduledAt = {};
      if (filters.startDate) {
        where.scheduledAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.scheduledAt.lte = filters.endDate;
      }
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
    paginationOptions.orderBy = { scheduledAt: 'desc' };
    paginationOptions.include = {
      campaign: {
        include: {
          owner: true,
          gameSystem: true,
        },
      },
      gm: true,
      _count: {
        select: {
          characters: true,
          messages: true,
        },
      },
    };

    return this.findWithPagination(where, paginationOptions);
  }

  /**
   * Get sessions by user participation
   */
  async findByUserParticipation(userId: string): Promise<GameSession[]> {
    try {
      return await this.model.findMany({
        where: {
          OR: [
            {
              gmId: userId,
            },
            {
              characters: {
                some: {
                  character: {
                    ownerId: userId,
                  },
                },
              },
            },
          ],
        },
        include: {
          campaign: {
            include: {
              owner: true,
              gameSystem: true,
            },
          },
          gm: true,
          characters: {
            include: {
              character: {
                include: {
                  owner: true,
                },
              },
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      });
    } catch (error) {
      this.handleError('findByUserParticipation', error);
      throw error;
    }
  }

  /**
   * Clean up old completed sessions
   */
  async cleanupOldSessions(daysOld: number = 90): Promise<{ count: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return this.deleteMany({
      status: 'COMPLETED',
      endedAt: {
        lt: cutoffDate,
      },
    });
  }

  /**
   * Helper method to get existing notes
   */
  private async getExistingNotes(id: string): Promise<string> {
    try {
      const session = await this.findUnique({ id });
      return session?.notes || '';
    } catch {
      return '';
    }
  }
}
