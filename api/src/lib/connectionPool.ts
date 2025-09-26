/**
 * Database connection pool manager
 * Provides advanced connection pooling and monitoring
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseConfig, DatabaseConfig } from '../config/database';
import { logger } from './logger';

export interface ConnectionPoolStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  waitingClients: number;
  poolUtilization: number;
  averageWaitTime: number;
  connectionErrors: number;
  lastError?: string | undefined;
  uptime: number;
}

export interface PoolHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  metrics: ConnectionPoolStats;
  recommendations?: string[] | undefined;
}

class ConnectionPoolManager {
  private prisma: PrismaClient | null = null;
  private config: DatabaseConfig;
  private startTime: number;
  private connectionErrors: number = 0;
  private lastError: string | undefined;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.config = getDatabaseConfig();
    this.startTime = Date.now();
    this.initializePool();
    this.startHealthMonitoring();
  }

  /**
   * Initialize the connection pool with optimized settings
   */
  private initializePool(): void {
    try {
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.config.url,
          },
        },
        log:
          this.config.logLevel === 'query'
            ? ['query', 'info', 'warn', 'error']
            : [this.config.logLevel],
        errorFormat: 'pretty',
        // Connection pool configuration
        // Note: Prisma doesn't expose direct pool configuration in the client
        // Pool settings are typically configured at the database level
      });

      // Set up error handling
      // Note: Prisma doesn't have a direct error event listener
      // Error handling is done through try-catch blocks

      // Graceful shutdown handlers
      this.setupGracefulShutdown();

      logger.info('Database connection pool initialized', {
        maxConnections: this.config.maxConnections,
        minConnections: this.config.minConnections,
        connectionTimeout: this.config.connectionTimeout,
        queryTimeout: this.config.queryTimeout,
      });
    } catch (error) {
      this.connectionErrors++;
      this.lastError = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Failed to initialize database connection pool:', error);
      throw error;
    }
  }

  /**
   * Get the Prisma client instance
   */
  public getClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Database connection pool not initialized');
    }
    return this.prisma;
  }

  /**
   * Get connection pool statistics
   */
  public async getPoolStats(): Promise<ConnectionPoolStats> {
    try {
      if (!this.prisma) {
        return this.getEmptyStats();
      }

      // Get PostgreSQL connection statistics
      const result = await this.prisma.$queryRaw<
        Array<{
          active_connections: number;
          idle_connections: number;
          total_connections: number;
          waiting_clients: number;
        }>
      >`
        SELECT 
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections,
          (SELECT count(*) FROM pg_stat_activity) as total_connections,
          (SELECT count(*) FROM pg_stat_activity WHERE wait_event_type = 'Lock') as waiting_clients
      `;

      const stats = result[0];
      const totalConnections = Number(stats?.total_connections || 0);
      const activeConnections = Number(stats?.active_connections || 0);
      const idleConnections = Number(stats?.idle_connections || 0);
      const waitingClients = Number(stats?.waiting_clients || 0);

      return {
        totalConnections,
        activeConnections,
        idleConnections,
        waitingClients,
        poolUtilization:
          totalConnections > 0
            ? (activeConnections / totalConnections) * 100
            : 0,
        averageWaitTime: 0, // Would need more complex monitoring to calculate
        connectionErrors: this.connectionErrors,
        lastError: this.lastError,
        uptime: Date.now() - this.startTime,
      };
    } catch (error) {
      logger.error('Failed to get connection pool stats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Check pool health
   */
  public async getPoolHealth(): Promise<PoolHealth> {
    const stats = await this.getPoolStats();
    const recommendations: string[] = [];

    // Determine health status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    let message = 'Connection pool is healthy';

    // Check for high error rate
    if (stats.connectionErrors > 10) {
      status = 'unhealthy';
      message = 'High connection error rate detected';
      recommendations.push(
        'Check database server status and network connectivity'
      );
    }

    // Check for high utilization
    if (stats.poolUtilization > 90) {
      if (status === 'healthy') status = 'degraded';
      message = 'High pool utilization detected';
      recommendations.push(
        'Consider increasing maxConnections or optimizing queries'
      );
    }

    // Check for waiting clients
    if (stats.waitingClients > 5) {
      if (status === 'healthy') status = 'degraded';
      message = 'Clients waiting for connections';
      recommendations.push(
        'Consider increasing pool size or optimizing connection usage'
      );
    }

    // Check for connection errors
    if (stats.connectionErrors > 0 && stats.connectionErrors < 10) {
      if (status === 'healthy') status = 'degraded';
      message = 'Some connection errors detected';
      recommendations.push('Monitor connection stability');
    }

    return {
      status,
      message,
      metrics: stats,
      recommendations: recommendations.length > 0 ? recommendations : undefined,
    };
  }

  /**
   * Test connection with retry logic
   */
  public async testConnection(): Promise<boolean> {
    if (!this.prisma) return false;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        return true;
      } catch (error) {
        logger.warn(`Connection test attempt ${attempt} failed:`, error);

        if (attempt < this.config.retryAttempts) {
          await new Promise((resolve) =>
            setTimeout(resolve, this.config.retryDelay)
          );
        }
      }
    }

    this.connectionErrors++;
    this.lastError = 'Connection test failed after all retry attempts';
    return false;
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      try {
        const health = await this.getPoolHealth();

        if (health.status !== 'healthy') {
          logger.warn('Database pool health check:', {
            status: health.status,
            message: health.message,
            recommendations: health.recommendations,
          });
        }
      } catch (error) {
        logger.error('Health monitoring error:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Setup graceful shutdown
   */
  private setupGracefulShutdown(): void {
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down database connections...`);

      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }

      if (this.prisma) {
        try {
          await this.prisma.$disconnect();
          logger.info('Database connections closed gracefully');
        } catch (error) {
          logger.error('Error during database shutdown:', error);
        }
      }

      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('beforeExit', () => shutdown('beforeExit'));
  }

  /**
   * Get empty stats for error cases
   */
  private getEmptyStats(): ConnectionPoolStats {
    return {
      totalConnections: 0,
      activeConnections: 0,
      idleConnections: 0,
      waitingClients: 0,
      poolUtilization: 0,
      averageWaitTime: 0,
      connectionErrors: this.connectionErrors,
      lastError: this.lastError,
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Close the connection pool
   */
  public async close(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }
  }
}

// Singleton instance
const connectionPool = new ConnectionPoolManager();

export { connectionPool };
export default connectionPool;
