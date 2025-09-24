export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
  checks: HealthChecks;
}

export interface HealthChecks {
  api: ServiceCheck;
  database?: ServiceCheck;
  redis?: ServiceCheck;
  memory: ServiceCheck;
  disk?: ServiceCheck;
}

export interface ServiceCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime?: number;
  message?: string;
  details?: Record<string, any>;
  lastChecked: string;
}

export interface DatabaseHealthCheck {
  connected: boolean;
  responseTime: number;
  version?: string;
  error?: string;
}

export interface RedisHealthCheck {
  connected: boolean;
  responseTime: number;
  version?: string;
  error?: string;
}

export interface MemoryHealthCheck {
  used: number;
  free: number;
  total: number;
  percentage: number;
  threshold: number;
}

export interface DiskHealthCheck {
  used: number;
  free: number;
  total: number;
  percentage: number;
  threshold: number;
}

export interface HealthCheckOptions {
  timeout?: number;
  includeDetails?: boolean;
  checkDatabase?: boolean;
  checkRedis?: boolean;
  checkDisk?: boolean;
}

export interface HealthMetrics {
  totalRequests: number;
  errorRate: number;
  averageResponseTime: number;
  lastError?: string;
  lastErrorTime?: string;
}
