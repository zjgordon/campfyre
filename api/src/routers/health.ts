import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import {
  performHealthCheck,
  checkDatabasePerformance,
  checkDatabaseConnections,
} from '../lib/healthChecks';
import { HealthCheckOptions } from '../types/health';
import { getDatabaseMonitor } from '../lib/monitoring';
import { getDatabaseHealthMetrics } from '../middleware/databaseHealth';
import { connectionPool } from '../lib/connectionPool';
import { queryOptimizer } from '../lib/queryOptimizer';
import { getPerformanceReport } from '../middleware/dbPerformance';

// Input validation schemas
const healthCheckInputSchema = z.object({
  timeout: z.number().min(1000).max(30000).optional(),
  includeDetails: z.boolean().optional(),
  checkDatabase: z.boolean().optional(),
  checkRedis: z.boolean().optional(),
  checkDisk: z.boolean().optional(),
});

/**
 * Enhanced health router with comprehensive monitoring
 */
export const healthRouter = router({
  // Basic health check (backward compatible)
  check: publicProcedure.query(async () => {
    const healthStatus = await performHealthCheck({
      checkDatabase: false,
      checkRedis: false,
      checkDisk: false,
    });

    return {
      ok: healthStatus.status === 'healthy',
      service: 'api',
      timestamp: healthStatus.timestamp,
      uptime: healthStatus.uptime,
      status: healthStatus.status,
    };
  }),

  // Simple ping endpoint
  ping: publicProcedure.query(() => {
    return {
      ok: true,
      msg: 'pong',
      timestamp: new Date().toISOString(),
    };
  }),

  // Comprehensive health status
  status: publicProcedure
    .input(healthCheckInputSchema.optional())
    .query(async ({ input }) => {
      const options: HealthCheckOptions = {
        timeout: input?.timeout || 5000,
        includeDetails: input?.includeDetails ?? true,
        checkDatabase: input?.checkDatabase ?? true,
        checkRedis: input?.checkRedis ?? true,
        checkDisk: input?.checkDisk ?? false,
      };

      return await performHealthCheck(options);
    }),

  // Quick health check (minimal checks)
  quick: publicProcedure.query(async () => {
    const healthStatus = await performHealthCheck({
      checkDatabase: false,
      checkRedis: false,
      checkDisk: false,
      includeDetails: false,
    });

    return {
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
      uptime: healthStatus.uptime,
    };
  }),

  // Detailed health check with all services
  detailed: publicProcedure.query(async () => {
    return await performHealthCheck({
      checkDatabase: true,
      checkRedis: true,
      checkDisk: true,
      includeDetails: true,
    });
  }),

  // Database health check only
  database: publicProcedure.query(async () => {
    const healthStatus = await performHealthCheck({
      checkDatabase: true,
      checkRedis: false,
      checkDisk: false,
    });

    return {
      status: healthStatus.status,
      database: healthStatus.checks.database,
      timestamp: healthStatus.timestamp,
    };
  }),

  // Redis health check only
  redis: publicProcedure.query(async () => {
    const healthStatus = await performHealthCheck({
      checkDatabase: false,
      checkRedis: true,
      checkDisk: false,
    });

    return {
      status: healthStatus.status,
      redis: healthStatus.checks.redis,
      timestamp: healthStatus.timestamp,
    };
  }),

  // Memory health check only
  memory: publicProcedure.query(async () => {
    const healthStatus = await performHealthCheck({
      checkDatabase: false,
      checkRedis: false,
      checkDisk: false,
    });

    return {
      status: healthStatus.status,
      memory: healthStatus.checks.memory,
      timestamp: healthStatus.timestamp,
    };
  }),

  // Readiness probe (for Kubernetes/container orchestration)
  ready: publicProcedure.query(async () => {
    const healthStatus = await performHealthCheck({
      checkDatabase: true,
      checkRedis: true,
      checkDisk: false,
      includeDetails: false,
    });

    return {
      ready: healthStatus.status === 'healthy',
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
    };
  }),

  // Liveness probe (for Kubernetes/container orchestration)
  live: publicProcedure.query(async () => {
    const healthStatus = await performHealthCheck({
      checkDatabase: false,
      checkRedis: false,
      checkDisk: false,
      includeDetails: false,
    });

    return {
      alive: healthStatus.status !== 'unhealthy',
      status: healthStatus.status,
      timestamp: healthStatus.timestamp,
      uptime: healthStatus.uptime,
    };
  }),

  // Database performance monitoring
  databasePerformance: publicProcedure.query(async () => {
    return await checkDatabasePerformance();
  }),

  // Database connection monitoring
  databaseConnections: publicProcedure.query(async () => {
    return await checkDatabaseConnections();
  }),

  // Database monitoring metrics
  databaseMetrics: publicProcedure.query(async () => {
    const monitor = getDatabaseMonitor();
    const dbMetrics = await getDatabaseHealthMetrics();

    return {
      performanceMetrics: monitor.getMetrics(),
      performanceSummary: monitor.getPerformanceSummary(),
      healthMetrics: dbMetrics,
      recentAlerts: monitor.getAlerts(20),
      queryHistory: monitor.getQueryHistory(50),
    };
  }),

  // Database alerts
  databaseAlerts: publicProcedure
    .input(
      z.object({
        severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        limit: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      const monitor = getDatabaseMonitor();

      if (input.severity) {
        return monitor.getAlertsBySeverity(input.severity);
      }

      return monitor.getAlerts(input.limit || 50);
    }),

  // Reset database monitoring metrics
  resetDatabaseMetrics: publicProcedure.mutation(async () => {
    const monitor = getDatabaseMonitor();
    monitor.resetMetrics();

    return {
      success: true,
      message: 'Database monitoring metrics reset',
      timestamp: new Date().toISOString(),
    };
  }),

  // Connection pool health
  connectionPool: publicProcedure.query(async () => {
    const poolHealth = await connectionPool.getPoolHealth();
    const poolStats = await connectionPool.getPoolStats();

    return {
      health: poolHealth,
      stats: poolStats,
      timestamp: new Date().toISOString(),
    };
  }),

  // Query performance analysis
  queryPerformance: publicProcedure.query(async () => {
    const performance = queryOptimizer.analyzePerformance();
    const stats = queryOptimizer.getPerformanceStats();

    return {
      analysis: performance,
      stats,
      timestamp: new Date().toISOString(),
    };
  }),

  // Overall performance report
  performanceReport: publicProcedure.query(async () => {
    return await getPerformanceReport();
  }),

  // Get query optimization suggestions
  querySuggestions: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const suggestions = queryOptimizer.getQuerySuggestions(input.query);

      return {
        query: input.query,
        suggestions,
        timestamp: new Date().toISOString(),
      };
    }),

  // Clear performance metrics
  clearPerformanceMetrics: publicProcedure.mutation(async () => {
    queryOptimizer.clearHistory();

    return {
      success: true,
      message: 'Performance metrics cleared',
      timestamp: new Date().toISOString(),
    };
  }),
});

export type HealthRouter = typeof healthRouter;
