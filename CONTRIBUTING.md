# Contributing to Campfyre

Thank you for your interest in contributing to Campfyre! This document provides guidelines for contributing to the project.

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

## Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Ensure all tests pass and code is properly formatted
4. Write a conventional commit message
5. Push your changes and create a pull request

## Getting Help

If you have questions about contributing, please open an issue or reach out to the maintainers.
