import { FastifyRequest, FastifyReply } from 'fastify';
import { getProductionConfig } from '../config/production';

// In-memory store for rate limiting (in production, use Redis or similar)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Rate limiting middleware
 */
export function createRateLimiter() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const config = getProductionConfig();

    if (!config.rateLimit.enabled) {
      return; // Rate limiting disabled
    }

    // Generate key for rate limiting
    const key = config.rateLimit.keyGenerator
      ? config.rateLimit.keyGenerator(request)
      : getDefaultKeyGenerator(request);

    const now = Date.now();
    const windowMs = config.rateLimit.timeWindow;
    const maxRequests = config.rateLimit.max;

    // Get or create rate limit entry
    let entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired entry
      entry = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Increment request count
    entry.count++;
    rateLimitStore.set(key, entry);

    // Check if limit exceeded
    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

      reply.header('X-RateLimit-Limit', maxRequests.toString());
      reply.header('X-RateLimit-Remaining', '0');
      reply.header(
        'X-RateLimit-Reset',
        new Date(entry.resetTime).toISOString()
      );
      reply.header('Retry-After', retryAfter.toString());

      reply.code(429).send({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter,
      });
      return;
    }

    // Add rate limit headers
    reply.header('X-RateLimit-Limit', maxRequests.toString());
    reply.header(
      'X-RateLimit-Remaining',
      Math.max(0, maxRequests - entry.count).toString()
    );
    reply.header('X-RateLimit-Reset', new Date(entry.resetTime).toISOString());
  };
}

/**
 * Default key generator for rate limiting
 */
function getDefaultKeyGenerator(request: FastifyRequest): string {
  const ip = request.ip || request.connection?.remoteAddress || 'unknown';
  const userAgent = request.headers['user-agent'] || 'unknown';

  // Combine IP and user agent for more granular rate limiting
  return `${ip}:${userAgent}`;
}

/**
 * Custom rate limiter for specific routes
 */
export function createCustomRateLimiter(options: {
  max: number;
  timeWindow: number;
  keyGenerator?: (request: FastifyRequest) => string;
  skipOnError?: boolean;
}) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const { max, timeWindow, keyGenerator, skipOnError = true } = options;

    try {
      const key = keyGenerator
        ? keyGenerator(request)
        : getDefaultKeyGenerator(request);

      const now = Date.now();

      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);

      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + timeWindow,
        };
      }

      // Increment request count
      entry.count++;
      rateLimitStore.set(key, entry);

      // Check if limit exceeded
      if (entry.count > max) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);

        reply.header('X-RateLimit-Limit', max.toString());
        reply.header('X-RateLimit-Remaining', '0');
        reply.header(
          'X-RateLimit-Reset',
          new Date(entry.resetTime).toISOString()
        );
        reply.header('Retry-After', retryAfter.toString());

        reply.code(429).send({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
          retryAfter,
        });
        return;
      }

      // Add rate limit headers
      reply.header('X-RateLimit-Limit', max.toString());
      reply.header(
        'X-RateLimit-Remaining',
        Math.max(0, max - entry.count).toString()
      );
      reply.header(
        'X-RateLimit-Reset',
        new Date(entry.resetTime).toISOString()
      );
    } catch {
      if (skipOnError) {
        // Skip rate limiting on error
        return;
      }

      reply.code(500).send({
        error: 'Internal Server Error',
        message: 'Rate limiting error',
      });
    }
  };
}

/**
 * Rate limiter for authentication endpoints
 */
export function createAuthRateLimiter() {
  return createCustomRateLimiter({
    max: 5, // 5 attempts per window
    timeWindow: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (request) => {
      const ip = request.ip || request.connection?.remoteAddress || 'unknown';
      return `auth:${ip}`;
    },
  });
}

/**
 * Rate limiter for API endpoints
 */
export function createAPIRateLimiter() {
  return createCustomRateLimiter({
    max: 100, // 100 requests per window
    timeWindow: 60 * 1000, // 1 minute
    keyGenerator: (request) => {
      const ip = request.ip || request.connection?.remoteAddress || 'unknown';
      return `api:${ip}`;
    },
  });
}

/**
 * Rate limiter for health check endpoints
 */
export function createHealthRateLimiter() {
  return createCustomRateLimiter({
    max: 10, // 10 requests per window
    timeWindow: 60 * 1000, // 1 minute
    keyGenerator: (request) => {
      const ip = request.ip || request.connection?.remoteAddress || 'unknown';
      return `health:${ip}`;
    },
  });
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupRateLimitStore() {
  const now = Date.now();

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  const now = Date.now();
  const activeEntries = Array.from(rateLimitStore.entries()).filter(
    ([_, entry]) => now <= entry.resetTime
  );

  return {
    totalEntries: rateLimitStore.size,
    activeEntries: activeEntries.length,
    expiredEntries: rateLimitStore.size - activeEntries.length,
  };
}

// Clean up expired entries every 5 minutes
setInterval(cleanupRateLimitStore, 5 * 60 * 1000);
