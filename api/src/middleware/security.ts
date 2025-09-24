import { FastifyRequest, FastifyReply } from 'fastify';
import { getProductionConfig } from '../config/production';

/**
 * Enhanced security middleware for production deployment
 */
export function createSecurityMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const config = getProductionConfig();

    // Add security headers
    if (config.security.helmet.hidePoweredBy) {
      reply.header('X-Powered-By', 'Campfyre');
    }

    // Add HSTS header in production
    if (config.security.helmet.hsts && config.security.helmet.hsts) {
      reply.header(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains; preload'
      );
    }

    // Add X-Frame-Options header
    if (config.security.helmet.frameguard) {
      reply.header('X-Frame-Options', 'DENY');
    }

    // Add X-Content-Type-Options header
    if (config.security.helmet.noSniff) {
      reply.header('X-Content-Type-Options', 'nosniff');
    }

    // Add X-XSS-Protection header
    if (config.security.helmet.xssFilter) {
      reply.header('X-XSS-Protection', '1; mode=block');
    }

    // Add Referrer-Policy header
    if (config.security.helmet.referrerPolicy) {
      reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Add Permissions-Policy header
    reply.header(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=(), interest-cohort=()'
    );

    // Add Content Security Policy in production
    if (config.security.helmet.contentSecurityPolicy) {
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ');

      reply.header('Content-Security-Policy', csp);
    }

    // Add Cross-Origin policies
    if (config.security.helmet.crossOriginResourcePolicy) {
      reply.header('Cross-Origin-Resource-Policy', 'same-origin');
    }

    if (config.security.helmet.crossOriginOpenerPolicy) {
      reply.header('Cross-Origin-Opener-Policy', 'same-origin');
    }

    if (config.security.helmet.crossOriginEmbedderPolicy) {
      reply.header('Cross-Origin-Embedder-Policy', 'require-corp');
    }

    // Add DNS prefetch control
    if (config.security.helmet.dnsPrefetchControl) {
      reply.header('X-DNS-Prefetch-Control', 'off');
    }

    // Add IE compatibility headers
    if (config.security.helmet.ieNoOpen) {
      reply.header('X-Download-Options', 'noopen');
    }

    // Add Origin-Agent-Cluster header
    if (config.security.helmet.originAgentCluster) {
      reply.header('Origin-Agent-Cluster', '?1');
    }
  };
}

/**
 * Request validation middleware
 */
export function createRequestValidationMiddleware() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const config = getProductionConfig();

    // Validate request size
    const contentLength = request.headers['content-length'];
    if (
      contentLength &&
      parseInt(contentLength, 10) > config.server.bodyLimit
    ) {
      reply.code(413).send({
        error: 'Request entity too large',
        message: `Request size exceeds limit of ${config.server.bodyLimit} bytes`,
      });
      return;
    }

    // Validate content type for POST/PUT/PATCH requests
    const method = request.method;
    const contentType = request.headers['content-type'];

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (!contentType || !contentType.includes('application/json')) {
        reply.code(415).send({
          error: 'Unsupported media type',
          message: 'Content-Type must be application/json',
        });
        return;
      }
    }

    // Validate user agent in production
    if (config.security.helmet.contentSecurityPolicy) {
      const userAgent = request.headers['user-agent'];
      if (!userAgent || userAgent.length < 10) {
        reply.code(400).send({
          error: 'Invalid user agent',
          message: 'User-Agent header is required',
        });
        return;
      }
    }
  };
}

/**
 * IP whitelist middleware (optional)
 */
export function createIPWhitelistMiddleware(allowedIPs: string[] = []) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (allowedIPs.length === 0) {
      return; // No whitelist configured
    }

    const clientIP =
      request.ip || request.connection?.remoteAddress || 'unknown';

    // Check if IP is in whitelist
    const isAllowed = allowedIPs.some((allowedIP) => {
      if (allowedIP.includes('/')) {
        // CIDR notation support (simplified)
        const baseIP = allowedIP.split('/')[0];
        return baseIP ? clientIP.startsWith(baseIP) : false;
      }
      return clientIP === allowedIP;
    });

    if (!isAllowed) {
      reply.code(403).send({
        error: 'Forbidden',
        message: 'Access denied from this IP address',
      });
      return;
    }
  };
}

/**
 * Security headers for specific routes
 */
export function addSecurityHeaders(
  reply: FastifyReply,
  additionalHeaders: Record<string, string> = {}
) {
  // Add cache control headers
  reply.header(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  reply.header('Pragma', 'no-cache');
  reply.header('Expires', '0');

  // Add additional security headers
  Object.entries(additionalHeaders).forEach(([key, value]) => {
    reply.header(key, value);
  });
}

/**
 * CORS preflight handler
 */
export function createCorsPreflightHandler() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const config = getProductionConfig();

    if (request.method === 'OPTIONS') {
      reply.header(
        'Access-Control-Allow-Origin',
        Array.isArray(config.security.cors.origin)
          ? config.security.cors.origin.join(', ')
          : config.security.cors.origin
      );
      reply.header(
        'Access-Control-Allow-Methods',
        config.security.cors.methods.join(', ')
      );
      reply.header(
        'Access-Control-Allow-Headers',
        config.security.cors.allowedHeaders.join(', ')
      );
      reply.header(
        'Access-Control-Max-Age',
        config.security.cors.maxAge.toString()
      );

      if (config.security.cors.credentials) {
        reply.header('Access-Control-Allow-Credentials', 'true');
      }

      reply.code(204).send();
      return;
    }
  };
}
