import { PrismaClient } from '@prisma/client';
import {
  getPrismaClient,
  testDatabaseConnection,
  getDatabaseHealth,
} from '../config/database';

// Re-export Prisma client and types
export { PrismaClient } from '@prisma/client';
export type {
  User,
  Campaign,
  CampaignMember,
  Character,
  GameSystem,
  GameSession,
  GameSessionCharacter,
  Message,
  Notification,
  UserSession,
  CampaignStatus,
  CampaignVisibility,
  CampaignRole,
  GameSessionStatus,
  MessageType,
  NotificationType,
} from '@prisma/client';

// Export database utilities
export { getPrismaClient, testDatabaseConnection, getDatabaseHealth };

/**
 * Database service class for common operations
 */
export class DatabaseService {
  private client: PrismaClient;

  constructor() {
    this.client = getPrismaClient();
  }

  /**
   * Get Prisma client instance
   */
  getClient(): PrismaClient {
    return this.client;
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    return testDatabaseConnection();
  }

  /**
   * Get database health information
   */
  async getHealth() {
    return getDatabaseHealth();
  }

  /**
   * User operations
   */
  async createUser(data: {
    email: string;
    username: string;
    name?: string;
    avatar?: string;
    bio?: string;
    preferences?: any;
  }) {
    return this.client.user.create({
      data,
    });
  }

  async findUserByEmail(email: string) {
    return this.client.user.findUnique({
      where: { email },
    });
  }

  async findUserByUsername(username: string) {
    return this.client.user.findUnique({
      where: { username },
    });
  }

  async findUserById(id: string) {
    return this.client.user.findUnique({
      where: { id },
      include: {
        ownedCampaigns: true,
        campaignMemberships: {
          include: {
            campaign: true,
          },
        },
        characters: true,
        sessions: true,
      },
    });
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      avatar?: string;
      bio?: string;
      preferences?: any;
      lastLoginAt?: Date;
    }
  ) {
    return this.client.user.update({
      where: { id },
      data,
    });
  }

  async deleteUser(id: string) {
    return this.client.user.delete({
      where: { id },
    });
  }

  /**
   * Campaign operations
   */
  async createCampaign(data: {
    name: string;
    description?: string;
    image?: string;
    visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
    maxPlayers?: number;
    gameSystemId: string;
    ownerId: string;
    settings?: any;
    metadata?: any;
  }) {
    return this.client.campaign.create({
      data,
      include: {
        owner: true,
        gameSystem: true,
      },
    });
  }

  async findCampaignById(id: string) {
    return this.client.campaign.findUnique({
      where: { id },
      include: {
        owner: true,
        members: {
          include: {
            user: true,
          },
        },
        characters: true,
        gameSessions: true,
        gameSystem: true,
      },
    });
  }

  async findCampaignsByOwner(ownerId: string) {
    return this.client.campaign.findMany({
      where: { ownerId },
      include: {
        owner: true,
        gameSystem: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveCampaigns() {
    return this.client.campaign.findMany({
      where: { status: 'ACTIVE' },
      include: {
        owner: true,
        gameSystem: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCampaign(
    id: string,
    data: {
      name?: string;
      description?: string;
      image?: string;
      status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
      visibility?: 'PRIVATE' | 'PUBLIC' | 'UNLISTED';
      maxPlayers?: number;
      settings?: any;
      metadata?: any;
    }
  ) {
    return this.client.campaign.update({
      where: { id },
      data,
      include: {
        owner: true,
        gameSystem: true,
      },
    });
  }

  async deleteCampaign(id: string) {
    return this.client.campaign.delete({
      where: { id },
    });
  }

  /**
   * Character operations
   */
  async createCharacter(data: {
    name: string;
    description?: string;
    image?: string;
    level?: number;
    experience?: number;
    characterSheet: any;
    campaignId: string;
    ownerId: string;
  }) {
    return this.client.character.create({
      data,
      include: {
        owner: true,
        campaign: true,
      },
    });
  }

  async findCharacterById(id: string) {
    return this.client.character.findUnique({
      where: { id },
      include: {
        owner: true,
        campaign: true,
        gameSessions: true,
      },
    });
  }

  async findCharactersByOwner(ownerId: string) {
    return this.client.character.findMany({
      where: { ownerId },
      include: {
        owner: true,
        campaign: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findCharactersByCampaign(campaignId: string) {
    return this.client.character.findMany({
      where: { campaignId },
      include: {
        owner: true,
        campaign: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCharacter(
    id: string,
    data: {
      name?: string;
      description?: string;
      image?: string;
      level?: number;
      experience?: number;
      characterSheet?: any;
    }
  ) {
    return this.client.character.update({
      where: { id },
      data,
      include: {
        owner: true,
        campaign: true,
      },
    });
  }

  async deleteCharacter(id: string) {
    return this.client.character.delete({
      where: { id },
    });
  }

  /**
   * Game System operations
   */
  async createGameSystem(data: {
    name: string;
    version?: string;
    description?: string;
    publisher?: string;
    characterSheetTemplate: any;
    rules?: any;
    metadata?: any;
  }) {
    return this.client.gameSystem.create({
      data,
    });
  }

  async findGameSystemById(id: string) {
    return this.client.gameSystem.findUnique({
      where: { id },
      include: {
        campaigns: true,
      },
    });
  }

  async findGameSystemByName(name: string) {
    return this.client.gameSystem.findUnique({
      where: { name },
      include: {
        campaigns: true,
      },
    });
  }

  async findActiveGameSystems() {
    return this.client.gameSystem.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateGameSystem(
    id: string,
    data: {
      name?: string;
      version?: string;
      description?: string;
      publisher?: string;
      characterSheetTemplate?: any;
      rules?: any;
      metadata?: any;
      isActive?: boolean;
    }
  ) {
    return this.client.gameSystem.update({
      where: { id },
      data,
    });
  }

  async deleteGameSystem(id: string) {
    return this.client.gameSystem.delete({
      where: { id },
    });
  }

  /**
   * Game Session operations
   */
  async createGameSession(data: {
    name: string;
    description?: string;
    scheduledAt?: Date;
    campaignId: string;
    gmId: string;
    settings?: any;
    notes?: string;
  }) {
    return this.client.gameSession.create({
      data,
      include: {
        campaign: true,
        gm: true,
      },
    });
  }

  async findGameSessionById(id: string) {
    return this.client.gameSession.findUnique({
      where: { id },
      include: {
        campaign: true,
        gm: true,
        characters: {
          include: {
            character: true,
          },
        },
        messages: true,
      },
    });
  }

  async findGameSessionsByCampaign(campaignId: string) {
    return this.client.gameSession.findMany({
      where: { campaignId },
      include: {
        campaign: true,
        gm: true,
      },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async updateGameSession(
    id: string,
    data: {
      name?: string;
      description?: string;
      scheduledAt?: Date;
      startedAt?: Date;
      endedAt?: Date;
      status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
      settings?: any;
      notes?: string;
    }
  ) {
    return this.client.gameSession.update({
      where: { id },
      data,
      include: {
        campaign: true,
        gm: true,
      },
    });
  }

  async deleteGameSession(id: string) {
    return this.client.gameSession.delete({
      where: { id },
    });
  }

  /**
   * Message operations
   */
  async createMessage(data: {
    content: string;
    type?:
      | 'TEXT'
      | 'SYSTEM'
      | 'DICE_ROLL'
      | 'CHARACTER_ACTION'
      | 'GM_ANNOUNCEMENT';
    metadata?: any;
    authorId: string;
    gameSessionId?: string;
  }) {
    return this.client.message.create({
      data,
      include: {
        author: true,
        gameSession: true,
      },
    });
  }

  async findMessageById(id: string) {
    return this.client.message.findUnique({
      where: { id },
      include: {
        author: true,
        gameSession: true,
      },
    });
  }

  async findMessagesByGameSession(gameSessionId: string) {
    return this.client.message.findMany({
      where: { gameSessionId },
      include: {
        author: true,
        gameSession: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async updateMessage(
    id: string,
    data: {
      content?: string;
      metadata?: any;
      isEdited?: boolean;
    }
  ) {
    return this.client.message.update({
      where: { id },
      data,
      include: {
        author: true,
        gameSession: true,
      },
    });
  }

  async deleteMessage(id: string) {
    return this.client.message.delete({
      where: { id },
    });
  }

  /**
   * User Session operations
   */
  async createUserSession(data: {
    token: string;
    expiresAt: Date;
    userId: string;
    deviceInfo?: any;
    ipAddress?: string;
  }) {
    return this.client.userSession.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findUserSessionByToken(token: string) {
    return this.client.userSession.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }

  async deleteUserSession(token: string) {
    return this.client.userSession.delete({
      where: { token },
    });
  }

  async deleteExpiredUserSessions() {
    return this.client.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Campaign Member operations
   */
  async createCampaignMember(data: {
    userId: string;
    campaignId: string;
    role?: 'OWNER' | 'GM' | 'PLAYER' | 'OBSERVER';
  }) {
    return this.client.campaignMember.create({
      data,
      include: {
        user: true,
        campaign: true,
      },
    });
  }

  async findCampaignMember(userId: string, campaignId: string) {
    return this.client.campaignMember.findUnique({
      where: {
        userId_campaignId: {
          userId,
          campaignId,
        },
      },
      include: {
        user: true,
        campaign: true,
      },
    });
  }

  async updateCampaignMember(
    userId: string,
    campaignId: string,
    data: {
      role?: 'OWNER' | 'GM' | 'PLAYER' | 'OBSERVER';
      isActive?: boolean;
    }
  ) {
    return this.client.campaignMember.update({
      where: {
        userId_campaignId: {
          userId,
          campaignId,
        },
      },
      data,
      include: {
        user: true,
        campaign: true,
      },
    });
  }

  async deleteCampaignMember(userId: string, campaignId: string) {
    return this.client.campaignMember.delete({
      where: {
        userId_campaignId: {
          userId,
          campaignId,
        },
      },
    });
  }

  /**
   * Cleanup operations
   */
  async cleanup() {
    // Delete expired user sessions
    await this.deleteExpiredUserSessions();

    // You can add more cleanup operations here
  }

  /**
   * Transaction operations
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
    return this.client.$transaction(fn);
  }

  /**
   * Raw query operations
   */
  async rawQuery<T = any>(query: string, ...params: any[]): Promise<T> {
    return this.client.$queryRawUnsafe(query, ...params);
  }
}

// Export singleton instance
export const db = new DatabaseService();
