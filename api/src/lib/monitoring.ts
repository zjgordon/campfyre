import { getPrismaClient } from '../config/database';
import { logger } from './logger';

/**
 * Database performance monitoring and metrics collection
 */
export interface DatabasePerformanceMetrics {
  queryCount: number;
  averageQueryTime: number;
  slowQueries: number;
  connectionPoolSize: number;
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  lastReset: Date;
}

export interface QueryMetrics {
  query: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export interface DatabaseAlert {
  type: 'performance' | 'connection' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  metrics?: Record<string, any>;
}

class DatabaseMonitor {
  private metrics: DatabasePerformanceMetrics = {
    queryCount: 0,
    averageQueryTime: 0,
    slowQueries: 0,
    connectionPoolSize: 0,
    activeConnections: 0,
    idleConnections: 0,
    totalConnections: 0,
    lastReset: new Date(),
  };

  private queryHistory: QueryMetrics[] = [];
  private alerts: DatabaseAlert[] = [];
  private readonly maxQueryHistory = 1000;
  private readonly maxAlerts = 100;
  private readonly slowQueryThreshold = 1000; // 1 second

  /**
   * Record a database query execution
   */
  recordQuery(
    query: string,
    duration: number,
    success: boolean,
    error?: string
  ): void {
    const queryMetric: QueryMetrics = {
      query: this.sanitizeQuery(query),
      duration,
      timestamp: new Date(),
      success,
      ...(error && { error }),
    };

    this.queryHistory.push(queryMetric);

    // Keep only the last N queries
    if (this.queryHistory.length > this.maxQueryHistory) {
      this.queryHistory = this.queryHistory.slice(-this.maxQueryHistory);
    }

    // Update metrics
    this.metrics.queryCount++;
    this.updateAverageQueryTime();

    if (duration > this.slowQueryThreshold) {
      this.metrics.slowQueries++;
      this.addAlert({
        type: 'performance',
        severity: duration > 5000 ? 'high' : 'medium',
        message: `Slow query detected: ${duration}ms`,
        timestamp: new Date(),
        metrics: { query: queryMetric.query, duration },
      });
    }

    if (!success) {
      this.addAlert({
        type: 'error',
        severity: 'high',
        message: `Query failed: ${error || 'Unknown error'}`,
        timestamp: new Date(),
        metrics: { query: queryMetric.query, error },
      });
    }
  }

  /**
   * Update connection pool metrics
   */
  async updateConnectionMetrics(): Promise<void> {
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

      const stats = result[0];
      if (stats) {
        this.metrics.activeConnections = Number(stats.active_connections);
        this.metrics.idleConnections = Number(stats.idle_connections);
        this.metrics.totalConnections = Number(stats.total_connections);
        this.metrics.connectionPoolSize = this.metrics.totalConnections;

        // Check for connection issues
        if (this.metrics.totalConnections > 80) {
          this.addAlert({
            type: 'connection',
            severity: 'high',
            message: `High connection count: ${this.metrics.totalConnections}`,
            timestamp: new Date(),
            metrics: { totalConnections: this.metrics.totalConnections },
          });
        } else if (this.metrics.totalConnections > 60) {
          this.addAlert({
            type: 'connection',
            severity: 'medium',
            message: `Elevated connection count: ${this.metrics.totalConnections}`,
            timestamp: new Date(),
            metrics: { totalConnections: this.metrics.totalConnections },
          });
        }
      }
    } catch (error) {
      logger.error('Failed to update connection metrics:', error);
      this.addAlert({
        type: 'error',
        severity: 'high',
        message: 'Failed to update connection metrics',
        timestamp: new Date(),
        metrics: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }

  /**
   * Get current performance metrics
   */
  getMetrics(): DatabasePerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Get query history
   */
  getQueryHistory(limit?: number): QueryMetrics[] {
    return limit ? this.queryHistory.slice(-limit) : [...this.queryHistory];
  }

  /**
   * Get recent alerts
   */
  getAlerts(limit?: number): DatabaseAlert[] {
    return limit ? this.alerts.slice(-limit) : [...this.alerts];
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: DatabaseAlert['severity']): DatabaseAlert[] {
    return this.alerts.filter((alert) => alert.severity === severity);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalQueries: number;
    averageResponseTime: number;
    slowQueryPercentage: number;
    errorRate: number;
    connectionUtilization: number;
  } {
    const totalQueries = this.queryHistory.length;
    const successfulQueries = this.queryHistory.filter((q) => q.success).length;
    const slowQueries = this.queryHistory.filter(
      (q) => q.duration > this.slowQueryThreshold
    ).length;

    const averageResponseTime =
      totalQueries > 0
        ? this.queryHistory.reduce((sum, q) => sum + q.duration, 0) /
          totalQueries
        : 0;

    const slowQueryPercentage =
      totalQueries > 0 ? (slowQueries / totalQueries) * 100 : 0;
    const errorRate =
      totalQueries > 0
        ? ((totalQueries - successfulQueries) / totalQueries) * 100
        : 0;
    const connectionUtilization =
      this.metrics.connectionPoolSize > 0
        ? (this.metrics.activeConnections / this.metrics.connectionPoolSize) *
          100
        : 0;

    return {
      totalQueries,
      averageResponseTime,
      slowQueryPercentage,
      errorRate,
      connectionUtilization,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      queryCount: 0,
      averageQueryTime: 0,
      slowQueries: 0,
      connectionPoolSize: this.metrics.connectionPoolSize,
      activeConnections: 0,
      idleConnections: 0,
      totalConnections: 0,
      lastReset: new Date(),
    };
    this.queryHistory = [];
    this.alerts = [];
    logger.info('Database monitoring metrics reset');
  }

  /**
   * Clear old alerts
   */
  clearOldAlerts(olderThanHours: number = 24): void {
    const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    this.alerts = this.alerts.filter((alert) => alert.timestamp > cutoffTime);
  }

  /**
   * Update average query time
   */
  private updateAverageQueryTime(): void {
    if (this.queryHistory.length === 0) return;

    const totalTime = this.queryHistory.reduce((sum, q) => sum + q.duration, 0);
    this.metrics.averageQueryTime = totalTime / this.queryHistory.length;
  }

  /**
   * Add an alert
   */
  private addAlert(alert: DatabaseAlert): void {
    this.alerts.push(alert);

    // Keep only the last N alerts
    if (this.alerts.length > this.maxAlerts) {
      this.alerts = this.alerts.slice(-this.maxAlerts);
    }

    // Log high severity alerts
    if (alert.severity === 'high' || alert.severity === 'critical') {
      logger.warn('Database alert:', alert);
    }
  }

  /**
   * Sanitize query for logging (remove sensitive data)
   */
  private sanitizeQuery(query: string): string {
    // Remove potential sensitive data from queries
    return query
      .replace(/password\s*=\s*'[^']*'/gi, "password='***'")
      .replace(/token\s*=\s*'[^']*'/gi, "token='***'")
      .replace(/secret\s*=\s*'[^']*'/gi, "secret='***'")
      .substring(0, 500); // Limit query length
  }
}

// Singleton instance
const databaseMonitor = new DatabaseMonitor();

/**
 * Prisma query interceptor for monitoring
 * Note: This is a simplified version that doesn't override Prisma methods
 * to avoid TypeScript compatibility issues
 */
export function createQueryInterceptor() {
  // For now, we'll rely on manual query recording
  // In a production environment, you might want to use Prisma middleware
  // or a more sophisticated approach to intercept queries

  logger.info('Database query interceptor initialized (manual recording mode)');
}

/**
 * Start database monitoring
 */
export function startDatabaseMonitoring(): void {
  // Set up query interceptor
  createQueryInterceptor();

  // Update connection metrics every 30 seconds
  setInterval(async () => {
    await databaseMonitor.updateConnectionMetrics();
  }, 30000);

  // Clear old alerts every hour
  setInterval(
    () => {
      databaseMonitor.clearOldAlerts(24);
    },
    60 * 60 * 1000
  );

  logger.info('Database monitoring started');
}

/**
 * Get database monitor instance
 */
export function getDatabaseMonitor(): DatabaseMonitor {
  return databaseMonitor;
}

export { databaseMonitor };
