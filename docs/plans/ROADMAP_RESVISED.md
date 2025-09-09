# 🔥 Campfyre – Revised Roadmap (User-Focused)

A high-level roadmap for guiding the development of **Campfyre** with a strong focus on user experience, device parity, and hybrid-first play.  
This roadmap reorganizes priorities based on research into community needs and gaps.

---

## Epic 1 — Foundations & Playable MVP

**North Star:** “Join from any device in under 2 minutes and play a full session with light automation.”

### Core Platform & Access

- One-line self-host (`docker compose up`) with clear health checks.
- Invite links with token scopes (player/observer, expiry).
- Device lab: verify **phone, tablet, desktop** (Safari/iOS, Chrome/Android, Windows, macOS).

### Communication

- **Voice-first WebRTC mesh (≤5 users)** with jitter buffer tuning, reconnects, push-to-talk, mic test.
- Video optional per user; adaptive audio-only fallback on weak networks.

### Session Surface (mobile-first UX)

- Resizable panes with presets: Map-first, Video-first, Character-focus, Split.
- Touch-friendly gestures (pinch zoom, two-finger pan).
- Inline dice roller (`/r 2d20+5`) with visible results & history.

### “Just-Enough” Automation

- Initiative tracker with turn reminders.
- Condition/status tags (icons on tokens & character cards).
- Dice math (sum, advantage/disadvantage, exploding dice, simple rerolls).

### System Templates (Top 3, day one)

- **D&D 5e**, **Pathfinder 2e**, **Call of Cthulhu** baseline sheets:
  - Core attributes, skills, HP/Sanity/Resolve, saves/checks, inventory/notes.
  - Pre-wired common rolls and per-system dice helpers.

### No-Code Homebrew (Alpha)

- Visual sheet builder: add fields (number/text/select), computed fields, dice buttons.
- Export/import JSON; share sheet with a link inside the campaign.

### Hybrid Basics

- **Table Display Mode:** clean, borderless scene/initiative view for a TV/projector.
- “In-room camera” slot (one feed fixed as the table cam).

✅ **Outcome:** A small group can self-host, invite from phones/tablets/PCs, talk clearly, run combat with light automation, and use 5e/PF2e/CoC sheets — plus build a simple homebrew sheet — within a single session.

---

## Epic 2 — Expanding the Table

**North Star:** “Reduce tool-juggling; make prep and hybrid play smooth.”

### Scenes, Maps & Fog

- Image maps; GM reveal (polygonal fog, soft brush).
- Tokens with snap/measure; ruler & area templates.
- Performance: large-map downscaling, tile caching.

### Handouts, Journals & Chat

- Drop images/PDFs into chat; pin to scene.
- Player journals (GM-shareable); quick notes with @mentions.

### Music & Ambience (Lite)

- GM playlist links (YouTube/Spotify/URL) + in-app volume cues.
- Local SFX triggers (dice clatter, door slam, thunder).

### No-Code Homebrew v1

- Sheet builder: sections/tabs, conditional fields, roll templates.
- Community sharing: import from gallery with preview.

### Hybrid Mode v1

- Dual-output: GM view + Table Display URL.
- Auto-layouts: show active speaker, initiative bar, current scene title on table view.

### Accessibility & Theming

- Player themes (dark/forest/neon); campaign-accent extraction from banner.
- Screen-reader labels for dice results & initiative; reduced motion option.

✅ **Outcome:** Fewer external apps; maps/handouts/music/chat live together; hybrid sessions feel intentional, not hacked together; homebrew creation is shareable and friendly.

---

## Epic 3 — V1 Polish, Community, and Scale-Path

**North Star:** “Feels professional, grows a library, and has a clear path to bigger tables.”

### Streaming & Overlays

- Overlay Mode URLs: dice pops, turn order, scene title.
- Safe margins (1080p/720p), privacy filters (avatar + display name only).

### Template Library & Community Ops

- In-app gallery (curated): 5e/PF2e/CoC variants, Fate, Blades, PbtA starters.
- Versioning & migrations for sheets; trust signals (verified/maintainer).

### Performance & Reliability Hardening

- Offline-tolerant actions queue; WS reconnect smoothing.
- Metric dashboards (CPU/mem, RTC stats); clear admin errors.

### SFU Upgrade Path (behind flag)

- Switchable media backend (LiveKit/mediasoup) for >5 users or streamer games.
- Graceful downgrade to mesh if SFU unavailable.

### Docs, Onboarding & Seeds

- “Run a demo in 2 minutes” script.
- Sample campaigns per system (pregens, maps, music cues).

✅ **Outcome:** A polished V1 with overlays, a living template library, hardened reliability, and a clear runway to larger tables via SFU.

---

## Cut-Lines & Guardrails

- **Must-have for MVP:** voice, invite links, dice, initiative, conditions, 5e/PF2e/CoC baseline sheets, map image + fog, no-code sheet alpha, table display.
- **Defer if needed:** dynamic lighting auto-wall detection, native music streaming, full SFU rollout (keep behind flag), advanced rule automation.
- **Always:** mobile parity, hybrid basics, and “one-page quick start.”

---

## Success Metrics (user-centric)

- **Time-to-table:** median < 2 minutes (spin-up → player rolls).
- **Call quality:** MOS ≥ 4.0 across 30-min sessions for 4–5 users.
- **Mobile parity:** ≥ 90% of sessions include ≥1 mobile/tablet without blockers.
- **Template adoption:** ≥ 60% of new campaigns use built-in 5e/PF2e/CoC; ≥ 20% install a community sheet within 30 days.
- **Tool reduction:** ≥ 50% of groups report dropping at least one external tool.

---
