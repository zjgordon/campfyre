import {
  HealthStatus,
  ServiceCheck,
  HealthCheckOptions,
} from '../types/health';
import { getDatabaseHealth, getConnectionStats } from '../config/database';
import { getDatabaseMonitor } from './monitoring';
import { getDatabaseHealthMetrics } from '../middleware/databaseHealth';

/**
 * Check API service health
 */
export async function checkApiHealth(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    // Basic API health check
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      message: 'API service is running',
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `API service error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check database connectivity with Prisma
 */
export async function checkDatabaseHealth(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    const health = await getDatabaseHealth();
    const responseTime = Date.now() - startTime;

    if (health.connected) {
      // Get additional database metrics
      const connectionStats = await getConnectionStats();
      const dbMetrics = await getDatabaseHealthMetrics();
      const monitor = getDatabaseMonitor();
      const performanceSummary = monitor.getPerformanceSummary();

      return {
        status: dbMetrics.healthStatus,
        responseTime,
        message: 'Database connection healthy',
        details: {
          connected: true,
          version: health.version,
          uptime: health.uptime,
          connectionStats,
          performanceMetrics: {
            averageResponseTime: dbMetrics.averageResponseTime,
            connectionCount: dbMetrics.connectionCount,
            activeConnections: dbMetrics.activeConnections,
            idleConnections: dbMetrics.idleConnections,
          },
          queryMetrics: {
            totalQueries: performanceSummary.totalQueries,
            averageQueryTime: performanceSummary.averageResponseTime,
            slowQueryPercentage: performanceSummary.slowQueryPercentage,
            errorRate: performanceSummary.errorRate,
            connectionUtilization: performanceSummary.connectionUtilization,
          },
        },
        lastChecked: new Date().toISOString(),
      };
    } else {
      return {
        status: 'unhealthy',
        responseTime,
        message: `Database connection failed: ${health.error || 'Unknown error'}`,
        lastChecked: new Date().toISOString(),
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Redis connectivity (placeholder for future Redis implementation)
 */
export async function checkRedisHealth(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    // TODO: Implement actual Redis connection check when Redis is added
    // For now, simulate a healthy Redis check
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      message: 'Redis connection healthy (simulated)',
      details: {
        connected: true,
        version: 'simulated',
      },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Redis connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check memory usage
 */
export async function checkMemoryHealth(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    const memUsage = process.memoryUsage();
    const totalMem = memUsage.heapTotal + memUsage.external;
    const usedMem = memUsage.heapUsed;
    const freeMem = totalMem - usedMem;
    const percentage = (usedMem / totalMem) * 100;

    // Consider unhealthy if memory usage is above 90%
    const threshold = 90;
    const status =
      percentage > threshold
        ? 'unhealthy'
        : percentage > 80
          ? 'degraded'
          : 'healthy';

    return {
      status,
      responseTime: Date.now() - startTime,
      message: `Memory usage: ${percentage.toFixed(2)}%`,
      details: {
        used: usedMem,
        free: freeMem,
        total: totalMem,
        percentage: Math.round(percentage * 100) / 100,
        threshold,
      },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check disk usage (placeholder for future implementation)
 */
export async function checkDiskHealth(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    // TODO: Implement actual disk usage check when needed
    // For now, simulate a healthy disk check
    const responseTime = Date.now() - startTime;

    return {
      status: 'healthy',
      responseTime,
      message: 'Disk usage healthy (simulated)',
      details: {
        used: 0,
        free: 0,
        total: 0,
        percentage: 0,
        threshold: 90,
      },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Disk check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check database performance metrics
 */
export async function checkDatabasePerformance(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    const monitor = getDatabaseMonitor();
    const performanceSummary = monitor.getPerformanceSummary();
    const metrics = monitor.getMetrics();
    const recentAlerts = monitor.getAlerts(10);

    // Determine status based on performance metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (
      performanceSummary.errorRate > 10 ||
      performanceSummary.slowQueryPercentage > 20
    ) {
      status = 'unhealthy';
    } else if (
      performanceSummary.errorRate > 5 ||
      performanceSummary.slowQueryPercentage > 10 ||
      performanceSummary.averageResponseTime > 500
    ) {
      status = 'degraded';
    }

    return {
      status,
      responseTime: Date.now() - startTime,
      message: `Database performance: ${status}`,
      details: {
        performanceSummary,
        metrics,
        recentAlerts: recentAlerts.map((alert) => ({
          type: alert.type,
          severity: alert.severity,
          message: alert.message,
          timestamp: alert.timestamp,
        })),
      },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Database performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check database connection pool health
 */
export async function checkDatabaseConnections(): Promise<ServiceCheck> {
  const startTime = Date.now();

  try {
    const connectionStats = await getConnectionStats();
    const dbMetrics = await getDatabaseHealthMetrics();

    // Determine status based on connection metrics
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (connectionStats.totalConnections > 80) {
      status = 'unhealthy';
    } else if (connectionStats.totalConnections > 60) {
      status = 'degraded';
    }

    return {
      status,
      responseTime: Date.now() - startTime,
      message: `Database connections: ${status}`,
      details: {
        connectionStats,
        healthMetrics: dbMetrics,
        utilization:
          connectionStats.totalConnections > 0
            ? (connectionStats.activeConnections /
                connectionStats.totalConnections) *
              100
            : 0,
      },
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      message: `Database connection check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Perform comprehensive health check
 */
export async function performHealthCheck(
  options: HealthCheckOptions = {}
): Promise<HealthStatus> {
  const {
    checkDatabase = true,
    checkRedis = true,
    checkDisk = false,
  } = options;

  try {
    // Run all health checks in parallel
    const checks = await Promise.allSettled([
      checkApiHealth(),
      checkMemoryHealth(),
      ...(checkDatabase ? [checkDatabaseHealth()] : []),
      ...(checkRedis ? [checkRedisHealth()] : []),
      ...(checkDisk ? [checkDiskHealth()] : []),
    ]);

    const healthChecks: HealthStatus['checks'] = {
      api:
        checks[0].status === 'fulfilled'
          ? checks[0].value
          : {
              status: 'unhealthy',
              message: 'API health check failed',
              lastChecked: new Date().toISOString(),
            },
      memory:
        checks[1].status === 'fulfilled'
          ? checks[1].value
          : {
              status: 'unhealthy',
              message: 'Memory health check failed',
              lastChecked: new Date().toISOString(),
            },
    };

    // Add database check if requested
    if (checkDatabase && checks[2]) {
      healthChecks.database =
        checks[2].status === 'fulfilled'
          ? checks[2].value
          : {
              status: 'unhealthy',
              message: 'Database health check failed',
              lastChecked: new Date().toISOString(),
            };
    }

    // Add Redis check if requested
    if (checkRedis && checks[3]) {
      healthChecks.redis =
        checks[3].status === 'fulfilled'
          ? checks[3].value
          : {
              status: 'unhealthy',
              message: 'Redis health check failed',
              lastChecked: new Date().toISOString(),
            };
    }

    // Add disk check if requested
    if (checkDisk && checks[4]) {
      healthChecks.disk =
        checks[4].status === 'fulfilled'
          ? checks[4].value
          : {
              status: 'unhealthy',
              message: 'Disk health check failed',
              lastChecked: new Date().toISOString(),
            };
    }

    // Determine overall status
    const allChecks = Object.values(healthChecks);
    const hasUnhealthy = allChecks.some(
      (check) => check.status === 'unhealthy'
    );
    const hasDegraded = allChecks.some((check) => check.status === 'degraded');

    const overallStatus = hasUnhealthy
      ? 'unhealthy'
      : hasDegraded
        ? 'degraded'
        : 'healthy';

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      checks: healthChecks,
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '0.1.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        api: {
          status: 'unhealthy',
          message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          lastChecked: new Date().toISOString(),
        },
        memory: {
          status: 'unhealthy',
          message: 'Memory check not performed',
          lastChecked: new Date().toISOString(),
        },
      },
    };
  }
}
