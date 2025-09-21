# 🏃 Campfyre Sprint Workflow (Cursor Update Loop)

A lightweight, repeatable loop for small, traceable tasks. Designed for pause/resume clarity and project visibility.

---

## 0) Prereqs (one-time)

- Ensure this repo contains:
  - `docs/CURRENT_SPRINT.md`, `docs/PROJECT_STATUS.md`, `docs/DECISIONS.md`
  - `meta/TASK_STATE.yaml`
  - `tasks/templates/CARD_TEMPLATE.yaml`, `tasks/templates/COMMIT_TEMPLATE.md`
- (Optional) Add a pre-commit hook that requires `CURRENT_SPRINT.md` to be updated when an active card is present.

---

## 1) Create a New Sprint

1. Create a folder:  
   `tasks/YYYY-MM-sprint-XX/`
2. In `docs/CURRENT_SPRINT.md`, set the sprint header and scope:
   ```md
   # CURRENT SPRINT – YYYY-MM Sprint XX

   > Scope: (short description)

   ## Progress Log
   ```
3. In `docs/PROJECT_STATUS.md`, add a section for the sprint:
   ```md
   ## YYYY-MM Sprint XX (Epic reference)

   - (Cursor will append one-liners here)
   ```

---

## 2) Define Task Cards (small bites)

- Copy `tasks/templates/CARD_TEMPLATE.yaml` → one file per task inside the sprint folder.
- Keep each card ≤ ~1 day of work.
- Example:
  ```yaml
  id: CARD-001
  title: Implement pre-join device check
  epic: Epic 1 – Foundations & MVP
  sprint: 2025-09-sprint-01
  status: todo
  owner: cursor
  links: ['/docs/ROADMAP.md#epic-1']
  acceptance:
    - Code compiles, lints, tests pass
    - Update CURRENT_SPRINT.md with summary
    - Update PROJECT_STATUS.md with one-liner
    - Commit uses Conventional Commits with [CARD-001]
  artifacts: []
  notes: |
    Include echo test and device switching. TURN required; warn if STUN-only.
  ```

---

## 3) Work a Card with Cursor (prompt)

Use this prompt (adapt as needed), one card at a time:

```
You are acting as a cautious, surgical engineer. Work only on <CARD-ID>.
Steps:
1) Read /meta/TASK_STATE.yaml; if <CARD-ID> is not active, set it active.
2) Implement the smallest change to satisfy the card’s acceptance.
3) After code/tests pass:
   - Append a 5–8 line entry to /docs/CURRENT_SPRINT.md for this card.
   - Add or update a single-line entry under this sprint in /docs/PROJECT_STATUS.md.
   - Update /meta/TASK_STATE.yaml with the next breadcrumb or mark complete.
4) Commit using Conventional Commits; include [<CARD-ID>] in the subject.
5) If blocked:
   - Set status: blocked in the card and TASK_STATE.yaml
   - Add a “Blocked” note in CURRENT_SPRINT.md with reason + proposed unblock.
Acceptance for this run:
- Acceptance items satisfied
- CURRENT_SPRINT and PROJECT_STATUS updated
- Tests green; lints/build OK
- One concise commit
```

---

## 4) Commit Format

Use Conventional Commits and include the card ID:

```
feat(video): pre-join device check flow [CARD-001]
fix(scheduling): normalize TZ rendering on session list [CARD-002]
docs(status): update CURRENT_SPRINT and PROJECT_STATUS [CARD-001]
```

Commit body (optional) template: `tasks/templates/COMMIT_TEMPLATE.md`.

---

## 5) Pause & Resume

- Cursor (or you) updates `meta/TASK_STATE.yaml` continuously:
  ```yaml
  active_card: CARD-001
  breadcrumb:
    step: 'Write e2e test for device switching'
    last_commit: 'feat(video): device switch UI [CARD-001]'
    next_action: 'Add echo test + update CURRENT_SPRINT'
  queue: [CARD-002, CARD-003]
  ```
- To resume after a pause, ask Cursor:  
  “Resume from `meta/TASK_STATE.yaml` on the active card.”

---

## 6) Blocked Work

When blocked:

1. Set `status: blocked` in the card and `TASK_STATE.yaml`.
2. Add a BLOCKED note in `CURRENT_SPRINT.md` (reason + proposed unblock).
3. Optionally add an entry in `DECISIONS.md` if the block reflects a pending decision.

---

## 7) Synthesize Sprint Status (on demand)

Prompt:

```
Read /docs/CURRENT_SPRINT.md and /meta/TASK_STATE.yaml.
Update /docs/PROJECT_STATUS.md:
- One bullet per completed card this sprint (short, informative).
- Active/blocked cards: include a 6–10 word status.
- Leave previous sprints untouched.
```

---

## 8) Definition of Done (DoD)

- Code compiles, lints, tests pass
- Feature behind a flag if risky
- `CURRENT_SPRINT.md` updated with a short entry
- `PROJECT_STATUS.md` updated with a one-liner
- `TASK_STATE.yaml` breadcrumb/active updated
- Conventional Commit pushed

---

## 9) Optional Extras

### Pre-commit guard (example)

```bash
# .git/hooks/pre-commit
#!/usr/bin/env bash
STATE="meta/TASK_STATE.yaml"
if [ -f "$STATE" ]; then
  ACTIVE=$(grep -E '^active_card:' "$STATE" | awk '{print $2}')
  if [ -n "$ACTIVE" ] && [ "$ACTIVE" != "null" ]; then
    if ! git diff --cached --name-only | grep -q "docs/CURRENT_SPRINT.md"; then
      echo "Pre-commit: ACTIVE=$ACTIVE but docs/CURRENT_SPRINT.md not updated."
      exit 1
    fi
  fi
fi
```

### Daily heartbeat (optional)

Add a “Daily” section in `CURRENT_SPRINT.md` with a 2–4 line roll-up, then re-run the synth step for `PROJECT_STATUS.md`.

---

## 10) Decisions (ADRs)

When you or Cursor make a non-trivial choice, record it in `docs/DECISIONS.md` using the template at the top of that file.

---

### TL;DR

**One card at a time → tiny commit → update two docs → move the state pointer.**  
This keeps Cursor honest, makes pauses painless, and gives you an always-current dashboard of progress.
