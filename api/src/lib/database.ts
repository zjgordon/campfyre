import { PrismaClient } from '@prisma/client';
import {
  getPrismaClient,
  testDatabaseConnection,
  getDatabaseHealth,
} from '../config/database';

// Re-export Prisma client and types
export { PrismaClient } from '@prisma/client';
export type { User, Game, Session, GameStatus } from '@prisma/client';

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
        games: true,
        sessions: true,
      },
    });
  }

  async updateUser(
    id: string,
    data: {
      name?: string;
      avatar?: string;
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
   * Game operations
   */
  async createGame(data: {
    name: string;
    description?: string;
    maxPlayers?: number;
    ownerId: string;
  }) {
    return this.client.game.create({
      data,
      include: {
        owner: true,
      },
    });
  }

  async findGameById(id: string) {
    return this.client.game.findUnique({
      where: { id },
      include: {
        owner: true,
      },
    });
  }

  async findGamesByOwner(ownerId: string) {
    return this.client.game.findMany({
      where: { ownerId },
      include: {
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActiveGames() {
    return this.client.game.findMany({
      where: { status: 'ACTIVE' },
      include: {
        owner: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateGame(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'CANCELLED';
      maxPlayers?: number;
      currentPlayers?: number;
    }
  ) {
    return this.client.game.update({
      where: { id },
      data,
      include: {
        owner: true,
      },
    });
  }

  async deleteGame(id: string) {
    return this.client.game.delete({
      where: { id },
    });
  }

  /**
   * Session operations
   */
  async createSession(data: {
    token: string;
    expiresAt: Date;
    userId: string;
  }) {
    return this.client.session.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findSessionByToken(token: string) {
    return this.client.session.findUnique({
      where: { token },
      include: {
        user: true,
      },
    });
  }

  async deleteSession(token: string) {
    return this.client.session.delete({
      where: { token },
    });
  }

  async deleteExpiredSessions() {
    return this.client.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }

  /**
   * Cleanup operations
   */
  async cleanup() {
    // Delete expired sessions
    await this.deleteExpiredSessions();

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
