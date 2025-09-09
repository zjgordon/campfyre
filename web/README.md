# Campfyre Web

The web client for Campfyre - a real-time collaborative storytelling platform.

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

The web service provides health endpoints:

- `/health` - JSON health status
- `/health.txt` - Plain text health status

## Docker

```bash
# Build and run with Docker Compose
docker compose up web
```
