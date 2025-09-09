# 🧭 Architecture Decision Records (ADRs)

Use this log to capture _why_ we made non-trivial choices. Keep entries concise (10–20 lines).
Each entry gets a date and a short title. Newest entries go on top.

> Tips
>
> - Prefer one decision per entry.
> - Link related PRs, issues, and code where helpful.
> - If a decision is reversed, add a new entry and link both ways.

---

## Template

### YYYY-MM-DD — <Short decision title>

**Context**  
What problem are we solving? Constraints? Options considered?

**Decision**  
What we chose and the scope of the decision.

**Consequences**  
Upsides, downsides, risks, follow-ups, and any TODOs.

**Links**

- PR/Issue:
- Docs/Spec:

---

## 2025-09-09 — Release & tagging strategy: semver, Conventional Commits, changelog

**Context**  
Need automated release process with version tracking, changelog generation, and GitHub releases for foundational sprint completion.

**Decision**  
Use semantic versioning starting at v0.0.x, Conventional Commits for changelog generation, and GitHub Actions for automated releases with draft creation.

**Consequences**  
Automated changelog generation from commit history. Draft releases allow review before publishing. Pre-release versions (v0.0.x) for foundational work.

**Links**

- Release workflow: `.github/workflows/release.yml`
- Changelog: `CHANGELOG.md`
- Contributing: `CONTRIBUTING.md#how-to-cut-a-release`

---

## 2025-09-09 — Trunk-based development over Git Flow

**Context**  
Solo/agent-assisted development with small-bite cards and CI-required checks. Need simple ops and fast merges.

**Decision**  
Use main as trunk with short-lived feature branches. Protected main branch with required CI checks.

**Consequences**  
Simpler operations and fast merges. Requires discipline to keep main green and avoid long-running branches.

**Links**

- Tech choices: `TECH_CHOICES.md#development-workflow`
- CI setup: `CARD-003`

---

## 2025-09-09 — WebRTC mesh for MVP; SFU adapter later

**Context**  
≤5 peers in MVP, self-host simplicity, fast time-to-value. Larger tables are out-of-scope initially.

**Decision**  
Use WebRTC mesh + WS signaling with TURN required. Define `RTCService` adapter seam for future SFU swap.

**Consequences**  
Easy MVP deployment and fast iteration. Won't scale past ~5 peers; plan SFU (LiveKit/mediasoup) behind feature flag.

**Links**

- Roadmap: `ROADMAP.md#epic-1`
- Tech choices: `TECH_CHOICES.md#real-time--video`

---

## 2025-09-09 — Template system as JSON/YAML + Zod

**Context**  
System-agnostic game templates must be versionable, diffable, and avoid vendor lock-in.

**Decision**  
File-based templates with JSON/YAML format, Zod validation, and semantic versioning with migrations.

**Consequences**  
Fast iteration now with safe evolvability later. Plugin bus architecture can follow this foundation.

**Links**

- Tech choices: `TECH_CHOICES.md#game-systems`
- Roadmap: `ROADMAP.md#epic-2`
