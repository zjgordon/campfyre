# Campfyre — modern, modular TTRPG hub

![CI](https://github.com/your-org/campfyre/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)

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

## Contributing

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages. See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.
