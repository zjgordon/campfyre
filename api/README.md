# Campfyre API

The API service for Campfyre - a real-time collaborative storytelling platform.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Health Check

The API provides a health endpoint at `/health` that returns:

```json
{
  "ok": true,
  "service": "api",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## Docker

```bash
# Build and run with Docker Compose
docker compose up api
```
