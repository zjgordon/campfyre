import { FastifyRequest, FastifyReply } from 'fastify';
import { getPrismaClient, getConnectionStats } from '../config/database';
import { logger } from '../lib/logger';

/**
 * Database health monitoring middleware
 * Tracks database performance and connection health
 */
export interface DatabaseHealthMetrics {
  connectionCount: number;
  activeConnections: number;
  idleConnections: number;
  averageResponseTime: number;
  lastHealthCheck: Date;
  healthStatus: 'healthy' | 'degraded' | 'unhealthy';
}

class DatabaseHealthMonitor {
  private metrics: DatabaseHealthMetrics = {
    connectionCount: 0,
    activeConnections: 0,
    idleConnections: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date(),
    healthStatus: 'healthy',
  };

  private responseTimes: number[] = [];
  private readonly maxResponseTimeHistory = 100;

  /**
   * Update database health metrics
   */
  async updateMetrics(): Promise<void> {
    try {
      const startTime = Date.now();

      // Test database connection with a simple query
      const client = getPrismaClient();
      await client.$queryRaw`SELECT 1`;

      const responseTime = Date.now() - startTime;
      this.responseTimes.push(responseTime);

      // Keep only the last N response times
      if (this.responseTimes.length > this.maxResponseTimeHistory) {
        this.responseTimes = this.responseTimes.slice(
          -this.maxResponseTimeHistory
        );
      }

      // Get connection statistics
      const connectionStats = await getConnectionStats();

      // Update metrics
      this.metrics = {
        connectionCount: connectionStats.totalConnections,
        activeConnections: connectionStats.activeConnections,
        idleConnections: connectionStats.idleConnections,
        averageResponseTime: this.calculateAverageResponseTime(),
        lastHealthCheck: new Date(),
        healthStatus: this.determineHealthStatus(responseTime, connectionStats),
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      this.metrics = {
        ...this.metrics,
        healthStatus: 'unhealthy',
        lastHealthCheck: new Date(),
      };
    }
  }

  /**
   * Get current database health metrics
   */
  getMetrics(): DatabaseHealthMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if database is healthy
   */
  isHealthy(): boolean {
    return this.metrics.healthStatus === 'healthy';
  }

  /**
   * Check if database is degraded
   */
  isDegraded(): boolean {
    return this.metrics.healthStatus === 'degraded';
  }

  /**
   * Check if database is unhealthy
   */
  isUnhealthy(): boolean {
    return this.metrics.healthStatus === 'unhealthy';
  }

  /**
   * Calculate average response time
   */
  private calculateAverageResponseTime(): number {
    if (this.responseTimes.length === 0) return 0;
    return (
      this.responseTimes.reduce((sum, time) => sum + time, 0) /
      this.responseTimes.length
    );
  }

  /**
   * Determine health status based on metrics
   */
  private determineHealthStatus(
    responseTime: number,
    connectionStats: {
      activeConnections: number;
      idleConnections: number;
      totalConnections: number;
    }
  ): 'healthy' | 'degraded' | 'unhealthy' {
    // Unhealthy conditions
    if (responseTime > 5000) return 'unhealthy'; // 5 second timeout
    if (connectionStats.totalConnections > 80) return 'unhealthy'; // Too many connections

    // Degraded conditions
    if (responseTime > 1000) return 'degraded'; // 1 second slow response
    if (connectionStats.totalConnections > 60) return 'degraded'; // High connection count
    if (this.calculateAverageResponseTime() > 500) return 'degraded'; // Slow average response

    return 'healthy';
  }

  /**
   * Get performance warnings
   */
  getPerformanceWarnings(): string[] {
    const warnings: string[] = [];

    if (this.metrics.averageResponseTime > 500) {
      warnings.push(
        `High average response time: ${this.metrics.averageResponseTime.toFixed(2)}ms`
      );
    }

    if (this.metrics.connectionCount > 60) {
      warnings.push(`High connection count: ${this.metrics.connectionCount}`);
    }

    if (this.metrics.activeConnections > 40) {
      warnings.push(
        `High active connections: ${this.metrics.activeConnections}`
      );
    }

    return warnings;
  }
}

// Singleton instance
const databaseHealthMonitor = new DatabaseHealthMonitor();

/**
 * Middleware to monitor database health on each request
 */
export async function databaseHealthMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // Only monitor database-related routes
  if (request.url.includes('/health') || request.url.includes('/api/')) {
    try {
      await databaseHealthMonitor.updateMetrics();

      // Add database health headers
      const metrics = databaseHealthMonitor.getMetrics();
      reply.header('X-Database-Health', metrics.healthStatus);
      reply.header(
        'X-Database-Response-Time',
        metrics.averageResponseTime.toFixed(2)
      );
      reply.header(
        'X-Database-Connections',
        metrics.connectionCount.toString()
      );

      // Log warnings if database is degraded
      if (databaseHealthMonitor.isDegraded()) {
        const warnings = databaseHealthMonitor.getPerformanceWarnings();
        logger.warn('Database performance degraded:', { warnings, metrics });
      }

      // Return 503 if database is unhealthy
      if (databaseHealthMonitor.isUnhealthy()) {
        logger.error('Database is unhealthy, returning 503');
        reply.status(503).send({
          error: 'Database unavailable',
          message: 'Database health check failed',
          timestamp: new Date().toISOString(),
        });
        return;
      }
    } catch (error) {
      logger.error('Database health middleware error:', error);
      // Don't block the request, just log the error
    }
  }
}

/**
 * Get database health metrics
 */
export async function getDatabaseHealthMetrics(): Promise<DatabaseHealthMetrics> {
  await databaseHealthMonitor.updateMetrics();
  return databaseHealthMonitor.getMetrics();
}

/**
 * Check database health status
 */
export async function checkDatabaseHealthStatus(): Promise<{
  healthy: boolean;
  degraded: boolean;
  unhealthy: boolean;
  metrics: DatabaseHealthMetrics;
}> {
  await databaseHealthMonitor.updateMetrics();
  const metrics = databaseHealthMonitor.getMetrics();

  return {
    healthy: databaseHealthMonitor.isHealthy(),
    degraded: databaseHealthMonitor.isDegraded(),
    unhealthy: databaseHealthMonitor.isUnhealthy(),
    metrics,
  };
}

/**
 * Start periodic database health monitoring
 */
export function startDatabaseHealthMonitoring(
  intervalMs: number = 30000
): void {
  setInterval(async () => {
    try {
      await databaseHealthMonitor.updateMetrics();
      const metrics = databaseHealthMonitor.getMetrics();

      if (metrics.healthStatus !== 'healthy') {
        logger.warn('Database health check result:', {
          status: metrics.healthStatus,
          metrics,
          warnings: databaseHealthMonitor.getPerformanceWarnings(),
        });
      }
    } catch (error) {
      logger.error('Periodic database health check failed:', error);
    }
  }, intervalMs);

  logger.info(
    `Database health monitoring started with ${intervalMs}ms interval`
  );
}

export { databaseHealthMonitor };
