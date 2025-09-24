import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { createErrorHandler } from './middleware/errorHandler';
import { createRequestLogger } from './middleware/logger';
import { getProductionConfig } from './config/production';
import {
  createSecurityMiddleware,
  createRequestValidationMiddleware,
} from './middleware/security';
import { createRateLimiter } from './middleware/rateLimiter';

export const createServer = async () => {
  const config = getProductionConfig();

  const loggerConfig = config.logging.pretty
    ? {
        level: config.logging.level,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        },
        redact: config.logging.redact,
      }
    : {
        level: config.logging.level,
        redact: config.logging.redact,
      };

  const fastify = Fastify({
    logger: loggerConfig,
    trustProxy: config.server.trustProxy,
    keepAliveTimeout: config.server.keepAliveTimeout,
    maxParamLength: config.server.maxParamLength,
    bodyLimit: config.server.bodyLimit,
    connectionTimeout: config.performance.connectionTimeout,
    requestTimeout: config.performance.requestTimeout,
  });

  // Register security middleware
  await fastify.register(helmet, config.security.helmet);

  // Register CORS middleware
  await fastify.register(cors, config.security.cors);

  // Register production middleware
  fastify.addHook('preHandler', createSecurityMiddleware());
  fastify.addHook('preHandler', createRequestValidationMiddleware());
  fastify.addHook('preHandler', createRateLimiter());
  fastify.addHook('preHandler', createRequestLogger());

  // Register error handler
  fastify.setErrorHandler(createErrorHandler() as any);

  return fastify;
};

export default createServer;
