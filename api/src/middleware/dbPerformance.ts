/**
 * Database performance monitoring middleware
 * Tracks query performance and provides optimization insights
 */

import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { queryOptimizer } from '../lib/queryOptimizer';
import { connectionPool } from '../lib/connectionPool';
import { logger } from '../lib/logger';

export interface PerformanceMetrics {
  requestId: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  queryCount: number;
  totalQueryTime: number;
  slowQueries: number;
  errors: number;
  poolStats?: any;
}

class DatabasePerformanceMiddleware {
  private requestMetrics: Map<string, PerformanceMetrics> = new Map();
  private performanceThresholds = {
    slowRequest: 1000, // 1 second
    verySlowRequest: 5000, // 5 seconds
    criticalRequest: 10000, // 10 seconds
  };

  /**
   * Middleware to track database performance
   */
  public async trackPerformance(
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ): Promise<void> {
    const requestId =
      request.id ||
      `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    // Initialize metrics for this request
    const metrics: PerformanceMetrics = {
      requestId,
      method: request.method,
      url: request.url,
      startTime,
      queryCount: 0,
      totalQueryTime: 0,
      slowQueries: 0,
      errors: 0,
    };

    this.requestMetrics.set(requestId, metrics);

    // Add performance headers
    reply.header('X-Request-ID', requestId);
    reply.header('X-Start-Time', startTime.toString());

    // Track response completion
    reply.raw.on('finish', () => {
      this.finalizeRequestMetrics(requestId);
    });

    // Track response errors
    reply.raw.on('error', (error) => {
      this.recordRequestError(requestId, error);
    });

    done();
  }

  /**
   * Record a database query execution
   */
  public recordQuery(
    requestId: string,
    query: string,
    duration: number,
    success: boolean,
    error?: string,
    parameters?: any[]
  ): void {
    const metrics = this.requestMetrics.get(requestId);
    if (!metrics) return;

    // Update request metrics
    metrics.queryCount++;
    metrics.totalQueryTime += duration;

    if (duration > 1000) {
      // 1 second threshold
      metrics.slowQueries++;
    }

    if (!success) {
      metrics.errors++;
    }

    // Record in query optimizer
    queryOptimizer.recordQuery(query, duration, success, error, parameters);

    // Log slow queries
    if (duration > this.performanceThresholds.slowRequest) {
      logger.warn('Slow database query detected:', {
        requestId,
        query: query.substring(0, 200),
        duration,
        success,
        error,
      });
    }
  }

  /**
   * Get performance report for a request
   */
  public getRequestMetrics(requestId: string): PerformanceMetrics | undefined {
    return this.requestMetrics.get(requestId);
  }

  /**
   * Get overall performance statistics
   */
  public async getPerformanceReport(): Promise<{
    activeRequests: number;
    averageResponseTime: number;
    slowRequests: number;
    errorRate: number;
    queryPerformance: any;
    poolHealth: any;
    recommendations: string[];
  }> {
    const activeRequests = this.requestMetrics.size;
    const completedRequests = Array.from(this.requestMetrics.values()).filter(
      (m) => m.endTime
    );

    const averageResponseTime =
      completedRequests.length > 0
        ? completedRequests.reduce((sum, m) => sum + (m.duration || 0), 0) /
          completedRequests.length
        : 0;

    const slowRequests = completedRequests.filter(
      (m) => (m.duration || 0) > this.performanceThresholds.slowRequest
    ).length;
    const errorRate =
      completedRequests.length > 0
        ? (completedRequests.filter((m) => m.errors > 0).length /
            completedRequests.length) *
          100
        : 0;

    const queryPerformance = queryOptimizer.analyzePerformance();
    const poolHealth = await connectionPool.getPoolHealth();

    const recommendations = this.generateRecommendations(
      averageResponseTime,
      slowRequests,
      errorRate,
      queryPerformance,
      poolHealth
    );

    return {
      activeRequests,
      averageResponseTime,
      slowRequests,
      errorRate,
      queryPerformance,
      poolHealth,
      recommendations,
    };
  }

  /**
   * Finalize request metrics
   */
  private finalizeRequestMetrics(requestId: string): void {
    const metrics = this.requestMetrics.get(requestId);
    if (!metrics) return;

    metrics.endTime = Date.now();
    metrics.duration = metrics.endTime - metrics.startTime;

    // Log performance warnings
    if (metrics.duration > this.performanceThresholds.verySlowRequest) {
      logger.warn('Slow request detected:', {
        requestId,
        method: metrics.method,
        url: metrics.url,
        duration: metrics.duration,
        queryCount: metrics.queryCount,
        slowQueries: metrics.slowQueries,
        errors: metrics.errors,
      });
    }

    // Clean up old metrics (keep only last 100 requests)
    if (this.requestMetrics.size > 100) {
      const sortedRequests = Array.from(this.requestMetrics.entries()).sort(
        ([, a], [, b]) => a.startTime - b.startTime
      );
      const oldestRequest = sortedRequests[0];
      if (oldestRequest) {
        this.requestMetrics.delete(oldestRequest[0]);
      }
    }
  }

  /**
   * Record request error
   */
  private recordRequestError(requestId: string, error: Error): void {
    const metrics = this.requestMetrics.get(requestId);
    if (metrics) {
      metrics.errors++;
    }

    logger.error('Request error:', {
      requestId,
      error: error.message,
      stack: error.stack,
    });
  }

  /**
   * Generate performance recommendations
   */
  private generateRecommendations(
    averageResponseTime: number,
    slowRequests: number,
    errorRate: number,
    queryPerformance: any,
    poolHealth: any
  ): string[] {
    const recommendations: string[] = [];

    if (averageResponseTime > 2000) {
      recommendations.push(
        'Consider optimizing database queries or adding caching'
      );
    }

    if (slowRequests > 10) {
      recommendations.push('Review slow queries and add appropriate indexes');
    }

    if (errorRate > 5) {
      recommendations.push('Investigate database connection stability');
    }

    if (poolHealth.status !== 'healthy') {
      recommendations.push('Check database connection pool configuration');
    }

    if (queryPerformance.slowQueries > 20) {
      recommendations.push('Optimize frequently executed slow queries');
    }

    return recommendations;
  }

  /**
   * Clear old metrics
   */
  public clearOldMetrics(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [requestId, metrics] of this.requestMetrics.entries()) {
      if (metrics.startTime < oneHourAgo) {
        this.requestMetrics.delete(requestId);
      }
    }
  }

  /**
   * Get current active requests
   */
  public getActiveRequests(): PerformanceMetrics[] {
    return Array.from(this.requestMetrics.values());
  }
}

// Singleton instance
const dbPerformanceMiddleware = new DatabasePerformanceMiddleware();

/**
 * Middleware function for Fastify
 */
export async function databasePerformanceMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): Promise<void> {
  return dbPerformanceMiddleware.trackPerformance(request, reply, done);
}

/**
 * Record a database query
 */
export function recordDatabaseQuery(
  requestId: string,
  query: string,
  duration: number,
  success: boolean,
  error?: string,
  parameters?: any[]
): void {
  dbPerformanceMiddleware.recordQuery(
    requestId,
    query,
    duration,
    success,
    error,
    parameters
  );
}

/**
 * Get performance report
 */
export async function getPerformanceReport() {
  return dbPerformanceMiddleware.getPerformanceReport();
}

/**
 * Get request metrics
 */
export function getRequestMetrics(requestId: string) {
  return dbPerformanceMiddleware.getRequestMetrics(requestId);
}

export { dbPerformanceMiddleware };
export default dbPerformanceMiddleware;
