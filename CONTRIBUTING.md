# Contributing to Campfyre

Thank you for your interest in contributing to Campfyre! This document provides guidelines for contributing to the project.

## Prerequisites

- Node.js 18+ (see [engines](package.json) for exact version)
- npm (comes with Node.js)
- Git

## Development Environment

### EditorConfig

EditorConfig enforces consistent style across different editors and IDEs. Most editors respect it automatically, ensuring consistent formatting with:

- 2 spaces for indentation
- LF line endings
- UTF-8 encoding
- Trim trailing whitespace
- Insert final newline

### Dev Container (Optional)

For the smoothest development experience, use the provided dev container:

1. Install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
2. Open the repository in VS Code / Cursor
3. When prompted, click "Reopen in Container"

The dev container includes:

- Node.js 20 runtime
- PostgreSQL, Redis, and Coturn services
- Pre-installed extensions (ESLint, Prettier, Prisma, Docker, GitLens)
- Automatic dependency installation
- Proper port forwarding for all services

### Bootstrap Script

For quick development environment setup, use the bootstrap script:

```bash
./scripts/bootstrap.sh
```

**When to use:**

- First-time development setup
- Resetting your local environment
- After pulling changes that affect services

**What it does:**

- Starts all Docker services (API, Web, Database, Redis, Coturn)
- Waits for health checks to pass
- Installs dependencies and builds packages
- Provides access URLs and next steps

**Resetting environment:**

```bash
docker compose down -v && ./scripts/bootstrap.sh
```

## Repository Layout

- `/web` - Frontend React application
- `/api` - Backend Node.js/Express API
- `/docs` - Project documentation and specifications
- `/tasks` - Sprint task cards and templates
- `/meta` - Project metadata and state tracking

## Development Commands

```bash
# Install dependencies
npm install

# Development commands
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run typecheck     # Run TypeScript type checking
npm run test          # Run unit tests
npm run test:watch    # Run tests in watch mode
npm run build         # Build all packages
npm run format        # Format code with Prettier
npm run format:check  # Check code formatting
```

## Architecture Decision Records (ADRs)

We maintain Architecture Decision Records in [docs/DECISIONS.md](docs/DECISIONS.md) to document significant architectural choices and their rationale.

### When to write an ADR

Write an ADR when making decisions that affect:

- **Non-trivial architectural choices or tradeoffs** - Technology selections, design patterns, system boundaries
- **Policy/process changes** - Branching strategies, release cadence, development workflows
- **Data model or contract decisions** - Error shapes, API contracts, template schemas
- **Reversals** - When reversing a previous decision, add a new ADR and cross-link the old one

### ADR Format

Each ADR should include:

- **Context** - What problem are we solving? What constraints exist?
- **Decision** - What we chose and the scope of the decision
- **Consequences** - Upsides, downsides, risks, and follow-up actions
- **Links** - References to related PRs, issues, docs, and specifications

Keep ADRs concise (10-20 lines) and focused on one decision per entry.

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/) to maintain a consistent and parseable commit history. This enables automated changelog generation and better project management.

### Commit Message Format

All commit messages must follow this format:

```
<type>(<scope>): <description> [<card-id>]
```

### Supported Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Scope

The scope should be the area of the codebase affected (e.g., `api`, `web`, `docs`, `ci`).

### Description

- Use lowercase for the description
- Do not end the description with a period
- Keep the description concise but descriptive
- Maximum 100 characters for the entire header

### Card ID

Include the relevant card ID in square brackets when working on specific tasks (e.g., `[CARD-004]`).

### Examples

```bash
feat(api): add /health endpoint [CARD-001]
fix(web): correct dice roller bug [CARD-010]
docs(status): update CURRENT_SPRINT and PROJECT_STATUS [CARD-004]
chore(deps): update dependencies to latest versions
ci(workflow): add automated testing to GitHub Actions
```

### Commit Message Validation

All commit messages are automatically validated using commitlint. If your commit message doesn't follow the conventional format, the commit will be rejected with a helpful error message.

## Task Workflow

We use a structured task management system for development:

### Task Cards

- Task cards are located in `/tasks/<sprint>/CARD-*.yaml`
- Each card contains acceptance criteria, artifacts, and implementation notes
- Cards are tracked in `/meta/TASK_STATE.yaml`

### Update Loop

When working on a task card:

1. Set the card as active in `TASK_STATE.yaml`
2. Implement the acceptance criteria
3. Update `docs/CURRENT_SPRINT.md` with a 5-8 line summary
4. Update `docs/PROJECT_STATUS.md` with a single-line entry
5. Update `TASK_STATE.yaml` to mark the card complete
6. Commit with `[CARD-XXX]` in the subject line

### Definition of Done

- All acceptance criteria satisfied
- Tests pass and code is properly formatted
- Documentation updated
- Single conventional commit created

## Pre-commit Setup

Pre-commit hooks are automatically installed when you run `npm install`. The hooks run:

- **lint-staged**: ESLint and Prettier on staged files
- **typecheck**: TypeScript compilation check
- **tests**: Unit test execution
- **commitlint**: Conventional commit message validation

### Bypassing Hooks (Not Recommended)

In emergencies, you can bypass hooks with:

```bash
git commit --no-verify -m "emergency fix"
```

## CI Overview

Our GitHub Actions pipeline runs on every push and pull request:

- **lint**: ESLint code quality checks
- **typecheck**: TypeScript compilation validation
- **test**: Unit test execution
- **build**: Package compilation

To re-run checks, push an empty commit:

```bash
git commit --allow-empty -m "ci: trigger pipeline"
```

**Note**: Update the CI badge URL in README.md after publishing the repository.

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass and code is properly formatted
4. Write a conventional commit message
5. Push your changes and create a pull request

## Getting Help

If you have questions about contributing, please open an issue or reach out to the maintainers.
