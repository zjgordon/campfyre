# 🔥 Campfyre Roadmap

A high-level three-epic roadmap for guiding the development of **Campfyre**.  
This roadmap is intentionally broad and pliable, to allow detailed decomposition into tasks and Cursor prompts later.

---

## **Epic 1 – Foundations & MVP**
**Goal:** Establish the development environment, framework, and a functional MVP that proves Campfyre’s value.

### Development Environment
- Pre-commit hooks, linting, formatting, and test harnesses.
- Cursor guardrails: structured prompts, non-destructive dev cycle.
- CI/CD basics: ensure every merge builds and passes checks.

### Framework Establishment
- Define high-level architecture (service boundaries, modularity).
- Implement templating substrate (JSON/YAML config for sheets & dice).
- Containerized deployment (`docker compose up`).

### MVP Features
- Self-hosting spin-up.
- Campaign & session management (light scheduling).
- Video/voice (≤5 players, WebRTC mesh).
- Character sheets driven by templates.
- Dice roller integrated with sheets.

✅ **Outcome:** Playable MVP with a real group, validating the core experience.

---

## **Epic 2 – Expanding the Table**
**Goal:** Move beyond bare-bones play into a rich, modern TTRPG hub.

### Session Enhancements
- Handouts, maps, fog-of-war reveals.
- Initiative and turn tracking.
- Recap log auto-capture (dice rolls, session notes).

### User Experience
- Player theming (dark, forest, neon, etc.).
- Flexible layouts (map view, character focus, split).

### Community & Templates
- Expand template library (D&D, Fate, Pathfinder).
- Allow template customization (file-based to start).
- Begin scaffolding for community sharing.

✅ **Outcome:** A full-featured digital table — video, maps, sheets, dice, and logs.

---

## **Epic 3 – Polishing to V1**
**Goal:** Add the extras that make Campfyre competitive, community-friendly, and streamer-ready.

### Streaming & Hybrid Play
- Overlay mode for OBS/Twitch (dice rolls, initiative, scene titles).
- Hybrid table support (one in-person video feed, others remote).

### Community & Ecosystem
- Streamlined template creation process.
- Contribution guidelines for open source community.
- Optional hosted “Pro” mode (non-self-hosting groups).

### Polish & Reliability
- Improved error handling and admin dashboards.
- Documentation for deployment, templating, and user onboarding.
- UI/UX refinements for smoothness and accessibility.

✅ **Outcome:** A strong **V1 release** — works well for self-hosted groups, streamer-friendly, and community-extendable.

---

## Summary
This roadmap balances:
- **Epic 1** → Lean and focused MVP foundations.  
- **Epic 2** → Depth and usability features.  
- **Epic 3** → Polish, community, and streaming tools.  

Together, these epics chart the path from first commit to a strong, viable **V1 release**.
