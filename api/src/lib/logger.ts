import pino from 'pino';
import type { Logger } from 'pino';

// Log levels configuration
export const LOG_LEVELS = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

// Logger configuration interface
export interface LoggerConfig {
  level: LogLevel;
  environment: 'development' | 'staging' | 'production';
  service: string;
  version?: string;
  enablePrettyPrint?: boolean;
  enableRedaction?: boolean;
  redactKeys?: string[];
  enableSerializers?: boolean;
}

// Default logger configuration
const defaultConfig: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  environment:
    (process.env.NODE_ENV as LoggerConfig['environment']) || 'development',
  service: process.env.SERVICE_NAME || 'campfyre-api',
  version: process.env.SERVICE_VERSION || '0.1.0',
  enablePrettyPrint: process.env.NODE_ENV === 'development',
  enableRedaction: process.env.NODE_ENV === 'production',
  redactKeys: ['password', 'token', 'secret', 'authorization', 'cookie'],
  enableSerializers: true,
};

// Create Pino logger instance
export const createLogger = (config: Partial<LoggerConfig> = {}): Logger => {
  const finalConfig = { ...defaultConfig, ...config };

  const pinoConfig: pino.LoggerOptions = {
    level: finalConfig.level,
    base: {
      service: finalConfig.service,
      version: finalConfig.version,
      environment: finalConfig.environment,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label) => ({ level: label }),
    },
    serializers: finalConfig.enableSerializers
      ? {
          req: pino.stdSerializers.req,
          res: pino.stdSerializers.res,
          err: pino.stdSerializers.err,
        }
      : {},
  };

  // Configure redaction for production
  if (finalConfig.enableRedaction && finalConfig.redactKeys) {
    pinoConfig.redact = {
      paths: finalConfig.redactKeys,
      censor: '[REDACTED]',
    };
  }

  // Configure pretty printing for development
  if (finalConfig.enablePrettyPrint) {
    pinoConfig.transport = {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname,service,version,environment',
        singleLine: false,
        hideObject: false,
        customPrettifiers: {
          time: (timestamp: string) => `🕐 ${timestamp}`,
        },
      },
    };
  }

  return pino(pinoConfig);
};

// Default logger instance
export const logger = createLogger();

// Request/response logging utilities
export interface RequestLogData {
  method: string;
  url: string;
  headers: Record<string, string>;
  query: Record<string, any>;
  params: Record<string, any>;
  body?: any;
  userAgent?: string | undefined;
  ip?: string | undefined;
  requestId?: string | undefined;
}

export interface ResponseLogData {
  statusCode: number;
  responseTime: number;
  headers: Record<string, string>;
  body?: any;
  requestId?: string | undefined;
}

export interface ErrorLogData {
  error: {
    name: string;
    message: string;
    stack?: string | undefined;
    code?: string | undefined;
    statusCode?: number | undefined;
  };
  request?: RequestLogData | undefined;
  response?: ResponseLogData | undefined;
  context?: Record<string, any> | undefined;
}

// Structured logging functions
export const logRequest = (logger: Logger, data: RequestLogData): void => {
  logger.info(
    {
      type: 'request',
      ...data,
    },
    `Incoming ${data.method} ${data.url}`
  );
};

export const logResponse = (logger: Logger, data: ResponseLogData): void => {
  const level = data.statusCode >= 400 ? 'warn' : 'info';

  logger[level](
    {
      type: 'response',
      ...data,
    },
    `Response ${data.statusCode} in ${data.responseTime}ms`
  );
};

export const logError = (logger: Logger, data: ErrorLogData): void => {
  logger.error(
    {
      type: 'error',
      ...data,
    },
    `Error: ${data.error.message}`
  );
};

export const logInfo = (
  logger: Logger,
  message: string,
  data?: Record<string, any>
): void => {
  logger.info(data, message);
};

export const logWarn = (
  logger: Logger,
  message: string,
  data?: Record<string, any>
): void => {
  logger.warn(data, message);
};

export const logDebug = (
  logger: Logger,
  message: string,
  data?: Record<string, any>
): void => {
  logger.debug(data, message);
};

// Performance logging
export const logPerformance = (
  logger: Logger,
  operation: string,
  duration: number,
  data?: Record<string, any>
): void => {
  const level = duration > 1000 ? 'warn' : 'info';

  logger[level](
    {
      type: 'performance',
      operation,
      duration,
      ...data,
    },
    `Performance: ${operation} took ${duration}ms`
  );
};

// Business logic logging
export const logBusinessEvent = (
  logger: Logger,
  event: string,
  data?: Record<string, any>
): void => {
  logger.info(
    {
      type: 'business',
      event,
      ...data,
    },
    `Business event: ${event}`
  );
};

// Security logging
export const logSecurityEvent = (
  logger: Logger,
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  data?: Record<string, any>
): void => {
  const level =
    severity === 'critical' ? 'error' : severity === 'high' ? 'warn' : 'info';

  logger[level](
    {
      type: 'security',
      event,
      severity,
      ...data,
    },
    `Security event: ${event} (${severity})`
  );
};

// Health check logging
export const logHealthCheck = (
  logger: Logger,
  status: 'healthy' | 'unhealthy',
  data?: Record<string, any>
): void => {
  const level = status === 'healthy' ? 'info' : 'error';

  logger[level](
    {
      type: 'health',
      status,
      ...data,
    },
    `Health check: ${status}`
  );
};

// Export default logger instance
export default logger;
