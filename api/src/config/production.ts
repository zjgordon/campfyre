export interface ProductionConfig {
  server: {
    port: number;
    host: string;
    trustProxy: boolean;
    keepAliveTimeout: number;
    headersTimeout: number;
    maxParamLength: number;
    bodyLimit: number;
    compression: boolean;
  };
  security: {
    helmet: {
      contentSecurityPolicy: boolean;
      crossOriginEmbedderPolicy: boolean;
      crossOriginOpenerPolicy: boolean;
      crossOriginResourcePolicy: boolean;
      dnsPrefetchControl: boolean;
      frameguard: boolean;
      hidePoweredBy: boolean;
      hsts: boolean;
      ieNoOpen: boolean;
      noSniff: boolean;
      originAgentCluster: boolean;
      permittedCrossDomainPolicies: boolean;
      referrerPolicy: boolean;
      xssFilter: boolean;
    };
    cors: {
      origin: string | string[] | boolean;
      credentials: boolean;
      methods: string[];
      allowedHeaders: string[];
      exposedHeaders: string[];
      maxAge: number;
    };
  };
  rateLimit: {
    enabled: boolean;
    max: number;
    timeWindow: number;
    skipOnError: boolean;
    keyGenerator?: (request: any) => string;
  };
  logging: {
    level: string;
    pretty: boolean;
    redact: string[];
  };
  performance: {
    connectionTimeout: number;
    requestTimeout: number;
    maxConnections: number;
    enableMetrics: boolean;
  };
}

export const getProductionConfig = (): ProductionConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    server: {
      port: parseInt(process.env.PORT || '3000', 10),
      host: process.env.HOST || '0.0.0.0',
      trustProxy: isProduction,
      keepAliveTimeout: isProduction ? 65000 : 5000,
      headersTimeout: isProduction ? 66000 : 6000,
      maxParamLength: 1000,
      bodyLimit: 1048576, // 1MB
      compression: isProduction,
    },
    security: {
      helmet: {
        contentSecurityPolicy: isProduction,
        crossOriginEmbedderPolicy: isProduction,
        crossOriginOpenerPolicy: isProduction,
        crossOriginResourcePolicy: isProduction,
        dnsPrefetchControl: isProduction,
        frameguard: true,
        hidePoweredBy: true,
        hsts: isProduction,
        ieNoOpen: true,
        noSniff: true,
        originAgentCluster: isProduction,
        permittedCrossDomainPolicies: false,
        referrerPolicy: true,
        xssFilter: true,
      },
      cors: {
        origin: isProduction
          ? (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',')
          : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: [
          'Origin',
          'X-Requested-With',
          'Content-Type',
          'Accept',
          'Authorization',
          'X-API-Version',
          'X-Request-ID',
        ],
        exposedHeaders: [
          'X-API-Version',
          'X-API-Deprecation-Warning',
          'X-Request-ID',
        ],
        maxAge: isProduction ? 86400 : 0, // 24 hours in production
      },
    },
    rateLimit: {
      enabled: isProduction,
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      timeWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000', 10), // 1 minute
      skipOnError: true,
      keyGenerator: (request) => {
        // Use IP address for rate limiting
        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        return ip;
      },
    },
    logging: {
      level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
      pretty: isDevelopment,
      redact: ['password', 'token', 'authorization', 'cookie'],
    },
    performance: {
      connectionTimeout: isProduction ? 30000 : 10000,
      requestTimeout: isProduction ? 30000 : 10000,
      maxConnections: isProduction ? 1000 : 100,
      enableMetrics: isProduction,
    },
  };
};

export const isProduction = (): boolean => {
  return process.env.NODE_ENV === 'production';
};

export const isDevelopment = (): boolean => {
  return process.env.NODE_ENV === 'development';
};

export const isTest = (): boolean => {
  return process.env.NODE_ENV === 'test';
};
