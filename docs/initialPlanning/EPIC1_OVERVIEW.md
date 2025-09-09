# 🌋 Epic 1 – Foundations & MVP (Overview)

**Goal:** Establish the development environment, framework, and a functional MVP that proves Campfyre’s value.  
This document decomposes Epic 1 into **phases with specific goals**. Each phase is small enough to decompose into cards and tasks using the sprint workflow.

---

## Phase 1 – Development Environment & Guardrails
**Objective:** Create a stable, incremental development environment where commits are safe, traceable, and non-destructive.

- Pre-commit hooks for linting, formatting, type-checking, and tests.
- CI/CD basics: every merge builds, tests, and reports status.
- Initialize **Cursor update loop**:
  - `CURRENT_SPRINT.md`, `PROJECT_STATUS.md`, `TASK_STATE.yaml` in place.
  - Cards and commit rules enforced.
- Establish initial repository layout:
  - `/api/`, `/web/`, `/docs/`, `/tasks/`, `/meta/`.

✅ *Outcome:* Contributors and Cursor can safely make small, traceable changes without breaking the project.

---

## Phase 2 – Framework Foundations
**Objective:** Lay down the skeleton architecture with modular boundaries and containerized deployment.

- Frontend scaffold (React + Vite + MD3 tokens).
- Backend scaffold (Node.js + Fastify/tRPC + Prisma).
- Database integration (PostgreSQL with Prisma migrations).
- Redis + Coturn in docker-compose (ready for presence & RTC).
- Container-first deployment (`docker compose up` works end-to-end).
- Reverse proxy (Caddy/Traefik) with HTTPS defaults.
- Error-shape contract defined (consistent JSON responses).
- Health endpoints for services.

✅ *Outcome:* A minimal “hello world” stack runs locally and in Docker, ready to host features incrementally.

---

## Phase 3 – Core MVP Features
**Objective:** Build the features required for a group to actually run a simple session.

- **Campaign & Session Management**
  - Create campaign (name, description, template).
  - Create session (title, date/time, notes).
  - List campaigns/sessions.
- **Video/Voice**
  - WebRTC mesh for ≤5 users.
  - Signaling via WebSocket.
  - Device check (mic/camera/output) pre-join flow.
  - TURN/STUN support for NAT traversal.
- **Templating Substrate**
  - JSON/YAML schema for character sheets.
  - Zod validation and versioning.
  - GM-only fields, hidden notes, computed values.
- **Character Sheets**
  - Load template-defined fields.
  - Editable values sync live for all players.
- **Dice Roller**
  - Parse dice expressions (`/r 2d20+5`).
  - Show results in group log.
  - Allow referencing sheet stats.

✅ *Outcome:* A playable MVP where a GM can host a campaign, players can join, and everyone can use video, sheets, and dice.

---

## Phase 4 – MVP Hardening
**Objective:** Ensure the MVP is reliable, testable, and future-proof.

- Playwright E2E: join flow, sheet update, dice roll, session lifecycle.
- Integration tests: schema validation, API contracts.
- Load testing for ≤5 peers in video mesh.
- Error handling and user-friendly messages (per UX guide).
- Admin basics:
  - Status page (sessions, peers, DB).
  - Logs + metrics (Prometheus).
- Export/import of campaigns (JSON + assets).
- ADRs in `DECISIONS.md` for final MVP architectural choices.

✅ *Outcome:* A hardened MVP demo-ready with clear future-proofing for Epic 2.

---

# Summary
Epic 1 phases:

1. **Dev Env & Guardrails** → safe, traceable dev cycle.  
2. **Framework Foundations** → skeleton architecture and containerization.  
3. **Core MVP Features** → campaigns, sessions, video, templates, sheets, dice.  
4. **MVP Hardening** → tests, error-handling, admin basics, export/import.  

Together these ensure Campfyre’s MVP is not just functional, but stable and extensible.
