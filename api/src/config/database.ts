import { PrismaClient } from '@prisma/client';

export interface DatabaseConfig {
  url: string;
  directUrl: string | undefined;
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  queryTimeout: number;
  idleTimeout: number;
  acquireTimeout: number;
  logLevel: 'query' | 'info' | 'warn' | 'error';
  poolSize: number;
  poolTimeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:password@localhost:5432/campfyre',
    directUrl: process.env.DIRECT_URL,
    maxConnections: isProduction ? 20 : 5,
    minConnections: isProduction ? 2 : 1,
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
    queryTimeout: parseInt(process.env.DB_QUERY_TIMEOUT || '30000'),
    idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '600000'), // 10 minutes
    acquireTimeout: parseInt(process.env.DB_ACQUIRE_TIMEOUT || '60000'), // 1 minute
    logLevel: isDevelopment ? 'query' : 'error',
    poolSize: parseInt(process.env.DB_POOL_SIZE || (isProduction ? '20' : '5')),
    poolTimeout: parseInt(process.env.DB_POOL_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
  };
};

// Global Prisma client instance
let prisma: PrismaClient | null = null;

/**
 * Get or create Prisma client instance with connection pooling
 */
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    const config = getDatabaseConfig();

    prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.url,
        },
      },
      log:
        config.logLevel === 'query'
          ? ['query', 'info', 'warn', 'error']
          : [config.logLevel],
      errorFormat: 'pretty',
    });

    // Graceful shutdown
    process.on('beforeExit', async () => {
      await prisma?.$disconnect();
    });

    process.on('SIGINT', async () => {
      await prisma?.$disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await prisma?.$disconnect();
      process.exit(0);
    });
  }

  return prisma;
}

/**
 * Get optimized Prisma client with connection pooling
 */
export function getOptimizedPrismaClient(): PrismaClient {
  // Import the connection pool manager
  const { connectionPool } = require('../lib/connectionPool');
  return connectionPool.getClient();
}

/**
 * Test database connection
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    const client = getPrismaClient();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

/**
 * Get database health information
 */
export async function getDatabaseHealth(): Promise<{
  connected: boolean;
  version?: string;
  uptime?: number;
  error?: string;
}> {
  try {
    const client = getPrismaClient();
    const startTime = Date.now();

    // Test connection and get version
    const result = await client.$queryRaw<Array<{ version: string }>>`
      SELECT version()
    `;

    const responseTime = Date.now() - startTime;

    const version = result[0]?.version;
    return {
      connected: true,
      ...(version && { version }),
      uptime: responseTime,
    };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Disconnect from database
 */
export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

/**
 * Database connection pool statistics
 */
export async function getConnectionStats(): Promise<{
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
}> {
  try {
    const client = getPrismaClient();
    const result = await client.$queryRaw<
      Array<{
        active_connections: number;
        idle_connections: number;
        total_connections: number;
      }>
    >`
      SELECT 
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
        (SELECT count(*) FROM pg_stat_activity) as total_connections
    `;

    return {
      activeConnections: Number(result[0]?.active_connections || 0),
      idleConnections: Number(result[0]?.idle_connections || 0),
      totalConnections: Number(result[0]?.total_connections || 0),
    };
  } catch {
    return {
      activeConnections: 0,
      idleConnections: 0,
      totalConnections: 0,
    };
  }
}
