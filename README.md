# Campfyre — modern, modular TTRPG hub

![CI](https://github.com/your-org/campfyre/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)
![Release](https://img.shields.io/github/v/release/your-org/campfyre?include_prereleases)

Gather, play, and tell your story — anywhere.

## Quickstart

### Docker (Recommended)

```bash
docker compose up -d
```

### Local Development

```bash
npm install
npm run build
npm run dev
```

### Dev Container (VS Code / Cursor)

For VS Code / Cursor users, a dev container is available for quick setup:

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the repository in VS Code / Cursor
3. When prompted, click "Reopen in Container"
4. The container will automatically set up Node.js, PostgreSQL, Redis, and Coturn services
5. Pre-installed extensions include ESLint, Prettier, Prisma, Docker, and GitLens

### Quickstart Dev Environment

For a complete development environment setup with demo data:

```bash
./scripts/bootstrap.sh
```

This script will:

- Start all Docker services (API, Web, Database, Redis, Coturn)
- Wait for health checks to pass
- Install dependencies and build packages
- Display access URLs and next steps

**First-time setup**: Run the bootstrap script to get a fully configured development environment.

**Resetting environment**: To start fresh, run:

```bash
docker compose down -v && ./scripts/bootstrap.sh
```

## Service Healthchecks

All services include health check endpoints for monitoring and debugging:

### API Service

- **Endpoint**: `GET http://localhost:3001/health`
- **Response**: `{ "ok": true, "service": "api", "timestamp": "...", "uptime": 123.45 }`
- **Check**: `curl http://localhost:3001/health`

### Web Service

- **Endpoint**: `GET http://localhost:3000/health.txt`
- **Response**: `ok`
- **Check**: `curl http://localhost:3000/health.txt`

### Database Services

- **PostgreSQL**: `pg_isready -U campfyre -d campfyre`
- **Redis**: `redis-cli ping`

### Docker Compose Health Status

```bash
# Check all service health status
docker compose ps

# View health check logs
docker compose logs [service-name]
```

## Repository Layout

- `/web` - Frontend React application
- `/api` - Backend Node.js/Express API
- `/docs` - Project documentation and specifications
- `/tasks` - Sprint task cards and templates
- `/meta` - Project metadata and state tracking

## Core Documentation

- [Roadmap](docs/plans/ROADMAP.md) - Project roadmap and milestones
- [Epic 1 Overview](docs/initialPlanning/EPIC1_OVERVIEW.md) - Current epic scope and goals
- [Tech Choices](docs/plans/TECH_CHOICES.md) - Technology stack decisions
- [UX Guide](docs/UX_GUIDE.md) - Design language and user experience guidelines
- [Sprint Workflow](docs/SPRINT_WORKFLOW.md) - Development process and task management
- [Decisions (ADRs)](docs/DECISIONS.md) - Architecture Decision Records

## License

This project is licensed under the GNU Affero General Public License v3.0. See [LICENSE](LICENSE) for details.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed list of changes and version history.

## Contributing

We follow trunk-based development with feature branches and pull requests. We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages. See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines including our branching & PR policy and how to open issues/PRs.
