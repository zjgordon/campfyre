# Campfyre API

A modern, production-ready API built with Fastify and tRPC, featuring comprehensive health monitoring, API versioning, and security features.

## Features

- **Fastify + tRPC Integration**: High-performance API with type-safe procedures
- **API Versioning**: Support for multiple API versions (v1, v2) with backward compatibility
- **Health Monitoring**: Comprehensive health checks for all services
- **Security**: Production-ready security headers, rate limiting, and CORS configuration
- **Error Handling**: Centralized error handling with structured logging
- **Production Ready**: Optimized for containerized deployment with Docker

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8.10.0+

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment configuration
cp .env.example .env

# Build the application
pnpm run build

# Start the development server
pnpm run dev
```

### Environment Configuration

Copy `.env.example` to `.env` and configure the following variables:

```bash
# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000

# Logging
LOG_LEVEL=info
```

## API Endpoints

### Health Endpoints

#### REST Endpoints

- `GET /health` - Comprehensive health status
- `GET /health/ready` - Readiness probe for Kubernetes
- `GET /health/live` - Liveness probe for Kubernetes
- `GET /ping` - Simple ping endpoint

#### tRPC Endpoints

- `GET /trpc/health.check` - Basic health check
- `GET /trpc/health.status` - Detailed health status
- `GET /trpc/health.quick` - Quick health check
- `GET /trpc/health.detailed` - Full health check with all services
- `GET /trpc/health.ready` - Readiness probe
- `GET /trpc/health.live` - Liveness probe

### Versioned Endpoints

#### v1 API

- `GET /trpc/v1.health.check` - v1 health check
- `GET /trpc/v1.health.ping` - v1 ping
- `GET /trpc/v1.root.info` - v1 API info

#### v2 API

- `GET /trpc/v2.health.check` - v2 health check with enhanced features
- `GET /trpc/v2.health.ping` - v2 ping with timestamp
- `GET /trpc/v2.health.status` - v2 status with memory info
- `GET /trpc/v2.root.info` - v2 API info with feature flags

## Development

### Available Scripts

```bash
# Development
pnpm run dev          # Start development server with hot reload
pnpm run build        # Build the application
pnpm run start        # Start production server
pnpm run lint         # Run ESLint
pnpm run typecheck    # Run TypeScript type checking

# Testing
pnpm test             # Run test suite
pnpm test:watch       # Run tests in watch mode
pnpm test:coverage    # Run tests with coverage
```

### Project Structure

```
api/
├── src/
│   ├── config/           # Configuration modules
│   │   └── production.ts # Production configuration
│   ├── lib/              # Utility libraries
│   │   ├── healthChecks.ts
│   │   └── versioning.ts
│   ├── middleware/       # Express middleware
│   │   ├── cors.ts
│   │   ├── errorHandler.ts
│   │   ├── healthMonitor.ts
│   │   ├── logger.ts
│   │   ├── rateLimiter.ts
│   │   ├── security.ts
│   │   └── versionHandler.ts
│   ├── routers/          # tRPC routers
│   │   ├── auth.ts
│   │   ├── games.ts
│   │   ├── health.ts
│   │   ├── index.ts
│   │   ├── users.ts
│   │   ├── v1/
│   │   └── v2/
│   ├── types/            # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── errors.ts
│   │   ├── game.ts
│   │   ├── health.ts
│   │   ├── index.ts
│   │   ├── shared.ts
│   │   └── user.ts
│   ├── index.ts          # Application entry point
│   ├── server.ts         # Fastify server configuration
│   └── trpc.ts           # tRPC configuration
├── Dockerfile            # Docker configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Production Deployment

### Docker

```bash
# Build the Docker image
docker build -t campfyre-api .

# Run the container
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e CORS_ORIGIN=https://yourdomain.com \
  campfyre-api
```

### Environment Variables

For production deployment, ensure the following environment variables are set:

```bash
NODE_ENV=production
PORT=3000
HOST=0.0.0.0
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=60000
LOG_LEVEL=info
```

### Health Checks

The API includes comprehensive health checks suitable for container orchestration:

- **Readiness Probe**: `GET /health/ready` - Checks if the service is ready to accept traffic
- **Liveness Probe**: `GET /health/live` - Checks if the service is alive and responsive

### Security Features

- **Rate Limiting**: Configurable rate limits per endpoint type
- **Security Headers**: Comprehensive security headers including CSP, HSTS, etc.
- **CORS**: Properly configured CORS for production
- **Request Validation**: Input validation and sanitization
- **Error Handling**: Structured error responses without information leakage

## API Versioning

The API supports multiple versions with backward compatibility:

- **v1**: Current stable version (default)
- **v2**: Enhanced version with additional features

### Version Detection

The API supports multiple methods for version detection:

1. **Path-based versioning**: `/trpc/v1/endpoint` or `/trpc/v2/endpoint`
2. **Accept header**: `Accept: application/vnd.campfyre.v1+json`
3. **Default fallback**: v1 when no version is specified

## Monitoring and Observability

### Health Monitoring

The API includes comprehensive health monitoring:

- **Service Health**: API service status
- **Memory Usage**: Memory consumption with configurable thresholds
- **Database Health**: Database connectivity checks (simulated)
- **Redis Health**: Redis connectivity checks (simulated)
- **Response Times**: Request/response time tracking

### Logging

Structured logging with Pino:

- **Development**: Pretty-printed logs with colors
- **Production**: JSON-formatted logs with redaction
- **Request Logging**: Automatic request/response logging
- **Error Logging**: Centralized error logging with context

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
