# 🛠️ Campfyre – Technical Choices

This document outlines the **default technical stack**, credible alternatives, and rationale for Campfyre.  
It is intended to guide development while leaving room for evolution as the project matures.

---

## Frontend

| Area            | Default Choice                                   | Alternatives                | Rationale |
|-----------------|--------------------------------------------------|-----------------------------|-----------|
| Framework       | **React + Vite**                                 | Next.js / Remix             | Simple, fast dev cycle, easy containerization; Next/Remix possible later for SSR/SEO needs |
| State Mgmt      | **TanStack Query + Zustand**                     | Redux Toolkit, MobX         | Clear split between server state and local UI; lightweight and performant |
| Forms/Validation| **Zod**                                          | Yup                         | Shared schemas across client & server; strong typing |
| Styling / UI    | **Material Design 3 (MD3)**                      | Radix + Tailwind (shadcn)   | Consistent, modern, accessible UI with token-based theming |
| Routing         | React Router                                     | Next.js routing             | SPA simplicity for self-hosting MVP |

---

## Backend

| Area          | Default Choice                | Alternatives            | Rationale |
|---------------|-------------------------------|-------------------------|-----------|
| Runtime       | **Node.js + Fastify/tRPC**    | Go (signaling service)  | Fast development, strong ecosystem; Go optional for RTC hot paths |
| Database      | **PostgreSQL**                | MySQL, SQLite (dev)     | Strong relational model; wide adoption |
| ORM           | **Prisma**                    | TypeORM, Sequelize      | Type-safe queries, migrations, seeding |
| Cache/PubSub  | **Redis**                     | NATS                    | Battle-tested for presence, fan-out |
| Storage       | **S3-compatible (MinIO)**     | Local FS (MVP only)     | Supports self-hosting + hosted option |

---

## Real-Time & Video

| Area             | Default Choice           | Alternatives               | Rationale |
|------------------|--------------------------|----------------------------|-----------|
| Signaling        | **WebSocket server**     | MQTT, SSE                  | Simple, reliable for sync + presence |
| Video/Voice      | **WebRTC mesh (≤5 users)** | SFU (LiveKit, mediasoup) | Mesh fits MVP scope; adapter ensures SFU migration path |
| TURN/STUN        | Coturn in Docker Compose | External service           | Needed for NAT traversal; self-host friendly |

---

## Game System Templating

- **Format:** JSON/YAML templates with Zod/Schema validation.  
- **Core entities:** sheet, fields, computed stats, dice rolls.  
- **Permissions:** GM-only fields, hidden notes.  
- **Versioning:** Semver, migrations to preserve campaign data.  
- **Future:** plug-in bus for richer mechanics, localization, modular sub-sheets (inventory, spellbook, etc.).

---

## Deployment & Ops

| Area             | Default Choice           | Rationale |
|------------------|--------------------------|-----------|
| Containerization | **Docker Compose**       | One-liner spin-up, dev parity |
| Reverse Proxy    | **Caddy / Traefik**      | Easy HTTPS, automatic certs |
| Metrics/Logs     | Prometheus + JSON logs   | Admin observability |
| Backups          | DB dump + asset snapshots| Self-host resilience |

---

## Testing & Stability

- **Pre-commit:** lint-staged + ESLint + Prettier + typecheck + unit tests.  
- **Unit Tests:** Vitest/Jest for evaluators, dice, reducers.  
- **Integration:** API contracts, migrations.  
- **E2E:** Playwright (join → play → recap flow).  
- **Feature Flags:** for risky panes (map/fog, overlays).  
- **Chaos Testing:** packet loss & WS drops to harden reconnect flows.

---

## Security & Privacy

- Invite tokens with expiry + scope (player/observer).  
- No mandatory accounts in MVP; minimal PII (name, avatar).  
- Content caps + sanitization for uploads.  
- Overlay URLs signed and short-lived to avoid leaks on stream.

---
