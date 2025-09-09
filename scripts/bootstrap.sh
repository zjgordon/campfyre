#!/bin/bash

set -e

echo "🚀 Campfyre Bootstrap Script"
echo "=============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1 && ! docker compose version > /dev/null 2>&1; then
    print_error "docker-compose is not available. Please install Docker Compose."
    exit 1
fi

# Use docker compose (newer) or docker-compose (legacy)
COMPOSE_CMD="docker compose"
if ! docker compose version > /dev/null 2>&1; then
    COMPOSE_CMD="docker-compose"
fi

print_status "Starting Docker services..."
$COMPOSE_CMD up -d

print_status "Waiting for services to be healthy..."
sleep 10

# Wait for API health check
print_status "Checking API health..."
for i in {1..30}; do
    if curl -f http://localhost:3001/health > /dev/null 2>&1; then
        print_success "API is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "API health check failed after 30 attempts"
        exit 1
    fi
    print_status "Waiting for API... (attempt $i/30)"
    sleep 2
done

# Wait for Web health check
print_status "Checking Web health..."
for i in {1..30}; do
    if curl -f http://localhost:3000/health.txt > /dev/null 2>&1; then
        print_success "Web service is healthy!"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "Web health check failed after 30 attempts"
        exit 1
    fi
    print_status "Waiting for Web service... (attempt $i/30)"
    sleep 2
done

print_status "Installing dependencies..."
npm install

print_status "Building packages..."
npm run build

print_success "🎉 Campfyre is ready!"
echo ""
echo -e "${GREEN}→ Web Interface:${NC} http://localhost:3000"
echo -e "${GREEN}→ API Endpoint:${NC} http://localhost:3001"
echo -e "${GREEN}→ Health Check:${NC} http://localhost:3001/health"
echo ""
echo "To stop services: docker compose down"
echo "To view logs: docker compose logs -f"
echo "To reset environment: docker compose down -v && ./scripts/bootstrap.sh"
