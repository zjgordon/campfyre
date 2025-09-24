import { FastifyRequest, FastifyReply } from 'fastify';
import { HealthMetrics } from '../types/health';

// Global health metrics storage
let healthMetrics: HealthMetrics = {
  totalRequests: 0,
  errorRate: 0,
  averageResponseTime: 0,
};

// Response time tracking
const responseTimes: number[] = [];
const maxResponseTimeHistory = 100;

/**
 * Health monitoring middleware
 * Tracks request metrics and health indicators
 */
export function createHealthMonitor() {
  return async (request: FastifyRequest, _reply: FastifyReply) => {
    const startTime = Date.now();

    // Increment total requests
    healthMetrics.totalRequests++;

    // Store start time on request for later use
    (request as any).startTime = startTime;
  };
}

/**
 * Response time tracking hook (to be registered on Fastify instance)
 */
export function createResponseTimeHook() {
  return async (request: FastifyRequest, reply: FastifyReply, payload: any) => {
    const startTime = (request as any).startTime;
    if (startTime) {
      const responseTime = Date.now() - startTime;

      // Track response time
      responseTimes.push(responseTime);

      // Keep only the last N response times
      if (responseTimes.length > maxResponseTimeHistory) {
        responseTimes.shift();
      }

      // Calculate average response time
      if (responseTimes.length > 0) {
        healthMetrics.averageResponseTime =
          responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length;
      }

      // Track errors
      if (reply.statusCode >= 400) {
        healthMetrics.lastError = `HTTP ${reply.statusCode}`;
        healthMetrics.lastErrorTime = new Date().toISOString();

        // Calculate error rate (simplified - in production, use a more sophisticated approach)
        const errorCount = responseTimes.filter((_, _index) => {
          // This is a simplified error tracking - in production, you'd want to track actual errors
          return false; // Placeholder
        }).length;

        healthMetrics.errorRate =
          healthMetrics.totalRequests > 0
            ? (errorCount / healthMetrics.totalRequests) * 100
            : 0;
      }
    }

    return payload;
  };
}

/**
 * Get current health metrics
 */
export function getHealthMetrics(): HealthMetrics {
  return { ...healthMetrics };
}

/**
 * Reset health metrics (useful for testing)
 */
export function resetHealthMetrics(): void {
  healthMetrics = {
    totalRequests: 0,
    errorRate: 0,
    averageResponseTime: 0,
  };
  responseTimes.length = 0;
}

/**
 * Get response time statistics
 */
export function getResponseTimeStats(): {
  average: number;
  min: number;
  max: number;
  count: number;
} {
  if (responseTimes.length === 0) {
    return {
      average: 0,
      min: 0,
      max: 0,
      count: 0,
    };
  }

  const sorted = [...responseTimes].sort((a, b) => a - b);

  return {
    average: healthMetrics.averageResponseTime,
    min: sorted[0] || 0,
    max: sorted[sorted.length - 1] || 0,
    count: responseTimes.length,
  };
}

/**
 * Check if the service is performing well based on metrics
 */
export function isServiceHealthy(): boolean {
  // Simple health check based on metrics
  const hasHighErrorRate = healthMetrics.errorRate > 10; // 10% error rate threshold
  const hasHighResponseTime = healthMetrics.averageResponseTime > 5000; // 5 second threshold
  const hasLowRequestVolume = healthMetrics.totalRequests === 0;

  return !hasHighErrorRate && !hasHighResponseTime && !hasLowRequestVolume;
}

/**
 * Get health status based on metrics
 */
export function getHealthStatusFromMetrics():
  | 'healthy'
  | 'degraded'
  | 'unhealthy' {
  if (!isServiceHealthy()) {
    return 'unhealthy';
  }

  // Check for degraded performance
  const hasModerateErrorRate = healthMetrics.errorRate > 5; // 5% error rate threshold
  const hasModerateResponseTime = healthMetrics.averageResponseTime > 2000; // 2 second threshold

  if (hasModerateErrorRate || hasModerateResponseTime) {
    return 'degraded';
  }

  return 'healthy';
}
