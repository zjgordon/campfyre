# Security Policy

## Reporting a Vulnerability

Please report vulnerabilities privately via email to zjgordon.dev@gmail.com.

**Do not open public issues for security problems.**

We aim to respond within 7 days and will work with you to resolve the issue before any public disclosure.

## Supported Versions

Only the latest release is actively supported for security fixes.

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |
| < 0.0.1 | :x:                |

## Security Measures

This project implements several security measures:

- **Automated dependency scanning** via Dependabot for security updates
- **Code scanning** via GitHub CodeQL for vulnerability detection
- **Branch protection** requiring code review before merging
- **Conventional Commits** for better change tracking and security audit trails

## Response Process

1. **Report** the vulnerability privately via email
2. **Acknowledge** receipt within 48 hours
3. **Investigate** and assess the severity within 7 days
4. **Develop** a fix for supported versions
5. **Coordinate** disclosure timeline with reporter
6. **Release** security update and publish advisory

## Security Best Practices

When contributing to this project:

- Follow secure coding practices
- Keep dependencies up to date
- Use the provided pre-commit hooks for code quality
- Report security issues privately, not in public issues
- Review security alerts from GitHub's security features
