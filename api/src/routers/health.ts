import { z } from 'zod';
import { router, publicProcedure } from '../trpc';
import { performHealthCheck } from '../lib/healthChecks';
import { HealthCheckOptions } from '../types/health';

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
});

export type HealthRouter = typeof healthRouter;
