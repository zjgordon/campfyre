import { FastifyRequest, FastifyReply } from 'fastify';

export interface RequestLogData {
  method: string;
  url: string;
  userAgent?: string | undefined;
  ip?: string | undefined;
  requestId?: string | undefined;
  timestamp: string;
}

export interface ResponseLogData {
  statusCode: number;
  responseTime: number;
  requestId?: string | undefined;
  timestamp: string;
}

export const createRequestLogger = () => {
  return (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
    const startTime = Date.now();
    const requestId =
      (request.headers['x-request-id'] as string) ||
      `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Add request ID to request object for use in other middleware
    (request as any).requestId = requestId;

    const logData: RequestLogData = {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      requestId,
      timestamp: new Date().toISOString(),
    };

    request.log.info(logData, 'Incoming request');

    // Log response when request completes
    reply.raw.on('finish', () => {
      const responseTime = Date.now() - startTime;
      const responseLogData: ResponseLogData = {
        statusCode: reply.statusCode,
        responseTime,
        requestId,
        timestamp: new Date().toISOString(),
      };

      request.log.info(responseLogData, 'Request completed');
    });

    done();
  };
};

export const createTRPCLogger = () => {
  return {
    log: (level: string, message: string, data?: any) => {
      console.log(
        `[tRPC ${level.toUpperCase()}] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    error: (message: string, data?: any) => {
      console.error(
        `[tRPC ERROR] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    warn: (message: string, data?: any) => {
      console.warn(
        `[tRPC WARN] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    info: (message: string, data?: any) => {
      console.info(
        `[tRPC INFO] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
    debug: (message: string, data?: any) => {
      console.debug(
        `[tRPC DEBUG] ${message}`,
        data ? JSON.stringify(data, null, 2) : ''
      );
    },
  };
};
