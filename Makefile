.PHONY: up dev infra down logs clean help

# Default target
help:
	@echo "Available targets:"
	@echo "  up     - Start all services (full stack)"
	@echo "  dev    - Start dev profile (web + api only)"
	@echo "  infra  - Start infra profile (db, redis, coturn, minio)"
	@echo "  down   - Stop all services"
	@echo "  logs   - Show logs for all services"
	@echo "  clean  - Stop services and remove volumes"
	@echo "  help   - Show this help message"

# Start all services (full stack)
up:
	docker compose up -d --profile all

# Start dev profile and run development servers
dev:
	docker compose up -d --profile dev
	@echo "Starting development servers..."
	pnpm dev

# Start infrastructure services only
infra:
	docker compose up -d --profile infra

# Stop all services
down:
	docker compose down

# Show logs for all services
logs:
	docker compose logs -f

# Stop services and remove volumes (clean slate)
clean:
	docker compose down -v
	docker compose rm -f
