# 🧭 Architecture Decision Records (ADRs)

Use this log to capture *why* we made non-trivial choices. Keep entries concise (10–20 lines).
Each entry gets a date and a short title. Newest entries go on top.

> Tips
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

## 2025-09-08 — (Example) Video mesh for MVP; SFU adapter later
**Context**  
≤5 participants in MVP, self-host simplicity, speed-to-value. Larger tables are out-of-scope initially.

**Decision**  
Use WebRTC mesh + WS signaling with TURN required. Define an `RTCService` adapter boundary to enable SFU swap (e.g., LiveKit/mediasoup) later.

**Consequences**  
Simple deploy, fast iteration. Won’t scale past ~5 peers; plan SFU pilot behind a feature flag in Epic 3.

**Links**  
- Roadmap: `ROADMAP.md#epic-1`  
- Tech choices: `TECH_CHOICES.md#real-time--video`
