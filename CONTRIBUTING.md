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

## Branching & PR Policy

We follow a trunk-based development approach with feature branches:

### Branch Strategy

- **Main branch**: `main` is the default and protected branch
- **Feature branches**: Create from `main` using format `feat/short-description`
- **Workflow**: Feature branch → Pull Request → Merge to main

### Branch Protection Rules

The `main` branch is protected with the following rules:

- **Status checks required**: All CI pipeline jobs (lint, typecheck, test, build) must pass
- **No force pushes**: Force pushes and deletions are disabled
- **Pull request required**: All changes must go through a pull request
- **Admin bypass**: Repository admins can bypass PR requirement if working solo
- **Linear history**: Optional - prefer squash or rebase merges over merge commits

### Pull Request Process

1. **Create feature branch**: `git checkout -b feat/your-feature-name`
2. **Work on single card**: Focus on one task card per branch
3. **Commit with card ID**: Include `[CARD-XXX]` in commit messages
4. **Open pull request**: Ensure CI checks pass (green status)
5. **Merge to main**: Use squash or rebase merge (avoid merge commits)

### Example Workflow

```bash
# Start new feature
git checkout main
git pull origin main
git checkout -b feat/add-user-authentication

# Work and commit
git add .
git commit -m "feat(auth): add user login endpoint [CARD-015]"

# Push and create PR
git push origin feat/add-user-authentication
# Create PR via GitHub UI

# After approval, merge via GitHub UI (squash recommended)
```

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass and code is properly formatted
4. Write a conventional commit message
5. Push your changes and create a pull request

## Submitting Issues & PRs

We use GitHub templates to standardize our workflow and keep task cards visible:

### Issue Templates

When opening a new issue, you'll be presented with three templates:

- **Bug Report** - For reporting bugs with reproduction steps, expected vs actual behavior, and environment details
- **Feature Request** - For suggesting new features with problem description, desired outcome, and alternatives considered
- **Chore Task** - For maintenance tasks and internal improvements

**Always reference the relevant card ID** (e.g., `[CARD-XXX]`) in your issue title and description.

### Pull Request Template

When creating a pull request, the template will automatically include:

- Summary of changes
- Linked card reference (`[CARD-XXX]`)
- Checklist for acceptance criteria, documentation updates, and CI status
- Sections for screenshots/logs and additional notes

**Always reference the relevant card ID** in your PR title and linked cards section.

### Template Usage

1. **Issues**: Use the appropriate template when creating issues to ensure all necessary information is captured
2. **PRs**: The PR template will be pre-filled - complete all sections and check all boxes before submitting
3. **Card References**: Always include `[CARD-XXX]` in titles and descriptions to maintain traceability

## Reviews & CODEOWNERS

We use GitHub's CODEOWNERS feature to ensure proper code review coverage and maintain code quality standards.

### Code Ownership

The repository uses a `.github/CODEOWNERS` file to define code ownership:

- **Default owner**: `@zjgordon` (maintainer) for the entire repository
- **Granular ownership**: Specific directories (`/web/`, `/api/`, `/docs/`) have dedicated owners
- **Automatic review requests**: GitHub automatically requests reviews from code owners when PRs are opened

### Review Requirements

All pull requests to the `main` branch require:

- **Minimum 1 approving review** from a code owner
- **Code owner approval** is mandatory (enforced by branch protection)
- **Stale approval dismissal** when new commits are pushed (ensures fresh reviews)

### When to Request Review

- **Always request review** from the relevant code owner when opening a PR
- **Use `[CARD-XXX]`** in commit and PR titles for traceability
- **Ensure CI passes** before requesting review to respect reviewers' time

### Admin Bypass Policy

Admin bypass is allowed only for:

- **Urgent hotfixes** requiring immediate deployment
- **Solo work** with green CI status
- **Documentation updates** that don't affect functionality

**Important**: Even with admin bypass, you must still update `CURRENT_SPRINT.md` and `PROJECT_STATUS.md` to maintain project tracking.

### Review Process

1. **Open PR** with proper card reference and description
2. **Request review** from relevant code owner (automatic via CODEOWNERS)
3. **Address feedback** and make necessary changes
4. **Wait for approval** before merging
5. **Merge via GitHub UI** using squash or rebase (avoid merge commits)

## How to Cut a Release

We use automated releases with semantic versioning and Conventional Commits for changelog generation.

### Release Process

1. **Ensure all changes are merged** to the `main` branch
2. **Create and push a tag** with the new version:
   ```bash
   git tag v0.0.1
   git push origin v0.0.1
   ```
3. **GitHub Actions will automatically**:
   - Run the full test and build pipeline
   - Generate changelog from Conventional Commits
   - Create a draft GitHub release with release notes
   - Update the CHANGELOG.md file

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

- **v0.0.x**: Pre-release versions for foundational work
- **v0.x.0**: Minor versions for new features
- **vx.0.0**: Major versions for breaking changes

### Release Automation

The release workflow (`.github/workflows/release.yml`) automatically:

- Triggers on any `v*.*.*` tag push
- Runs tests and builds to ensure quality
- Uses `conventional-changelog/standard-version` to generate changelog
- Creates a draft GitHub release with generated notes
- Updates the CHANGELOG.md file with new entries

### Manual Release Steps

If you need to create a release manually:

1. Tag the commit: `git tag v0.0.1`
2. Push the tag: `git push origin v0.0.1`
3. Check the GitHub Actions tab for the release workflow
4. Review and publish the draft release on GitHub

## CHANGELOG Maintenance

We maintain a [CHANGELOG.md](CHANGELOG.md) following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format to document all notable changes to the project.

### Automatic vs Manual Updates

- **Automatic**: The release workflow automatically generates changelog entries from Conventional Commits when creating releases
- **Manual**: For now, CHANGELOG may be updated manually alongside releases for additional context or clarification

### Conventional Commit to Changelog Mapping

When updating the changelog manually, map Conventional Commit types to changelog sections:

- **feat** → **Added** (new features)
- **fix** → **Fixed** (bug fixes)
- **chore/refactor/style** → **Changed** (internal changes, refactoring, formatting)
- **docs** → **Documentation** (not always included unless significant)
- **perf** → **Changed** (performance improvements)
- **test** → **Changed** (test additions or improvements)

### Changelog Structure

Each version entry should include:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added

- New features and capabilities

### Changed

- Changes to existing functionality

### Deprecated

- Features marked for removal

### Removed

- Features removed in this version

### Fixed

- Bug fixes

### Security

- Security improvements or fixes
```

### When to Update

- **Before releases**: Ensure CHANGELOG.md is up to date before tagging a new version
- **During development**: Add entries to the `[Unreleased]` section for significant changes
- **After releases**: Move `[Unreleased]` entries to the new version section

## Getting Help

If you have questions about contributing, please open an issue or reach out to the maintainers.
