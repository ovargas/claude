---
name: checkpoints
description: Checkpoint protocol for resuming multi-phase commands after session interruptions
loaded_by: /debug, /epic, /feature, /implement, /plan
---

# Checkpoints Skill

Checkpoints let multi-phase commands survive session interruptions. When a phase completes, the command writes a checkpoint file. When the command is re-invoked, it reads the checkpoint and resumes from the first incomplete phase.

## File Location and Naming

Checkpoint files live in `docs/checkpoints/`:

```
docs/checkpoints/<command>-<ID>.md
```

Where:
- `<command>` is the command name: `debug`, `epic`, `feature`, `implement`, `plan`
- `<ID>` is the item identifier the command is working on (e.g., `FEAT-003`, `EPIC-001`, `BUG-012`, the plan filename slug)

Examples:
```
docs/checkpoints/feature-FEAT-003.md
docs/checkpoints/implement-2026-02-12-notifications.md
docs/checkpoints/debug-BUG-012.md
docs/checkpoints/epic-EPIC-001.md
docs/checkpoints/plan-FEAT-007.md
```

If the item has no formal ID (e.g., a debug session started from a symptom description), derive a short slug from the context (e.g., `debug-login-timeout`).

## Checkpoint File Format

```markdown
---
command: <command>
item: <ID or description>
started: <ISO 8601 timestamp>
updated: <ISO 8601 timestamp>
status: in_progress
---

# Checkpoint: <command> — <item>

## Phases

| # | Phase | Status | Completed |
|---|---|---|---|
| 0 | Decision Sync | done | 2026-02-27T10:15:00Z |
| 1 | Capture | done | 2026-02-27T10:32:00Z |
| 2 | Product Analysis | in_progress | — |
| 3 | Technical Routing | pending | — |
| 4 | Agreements | pending | — |
| 5 | Document | pending | — |

## Current State

<!-- Brief description of where things stand — what was the last thing completed,
     what's next, any decisions made or blockers encountered. Keep this short
     but specific enough to resume without re-reading everything. -->

## Key Decisions

<!-- Capture decisions made during completed phases that affect later phases.
     This prevents re-asking the user questions they already answered. -->

- [Phase 0] Synced with hub decisions ADR-005 and ADR-008
- [Phase 1] Scope confirmed: notifications for orders only, not marketing

## Artifacts Produced

<!-- List files created or modified by completed phases. This tells the
     resuming session what already exists and doesn't need to be recreated. -->

- `docs/epics/EPIC-001-notifications.md` (draft, through Phase 1)
- `docs/decisions/2026-02-27-notification-transport.md`
```

## Phase Definitions by Command

Each command has a fixed set of phases. The checkpoint tracks progress through these phases.

### `/debug`

| # | Phase | Checkpoint written when |
|---|---|---|
| 1 | Reproduce | Bug is confirmed reproducible (or confirmed not reproducible with notes) |
| 2 | Trace | Code path is traced, relevant files and flows identified |
| 3 | Root Cause | Root cause is identified and documented |
| 4 | Document | Bug report is written to `docs/bugs/` |

### `/epic`

| # | Phase | Checkpoint written when |
|---|---|---|
| 0 | Decision Sync | Existing hub decisions are read and conflicts identified |
| 1 | Capture | Initiative is described — problem, goal, scope |
| 2 | Product Analysis | Market/user/value analysis is complete |
| 3 | Technical Routing | Affected repos identified, work is routed |
| 4 | Agreements | Cross-team decision documents are written |
| 5 | Document | Epic document is written to `docs/epics/` |

### `/feature`

| # | Phase | Checkpoint written when |
|---|---|---|
| 1 | Understand | Feature is parsed, context gathered, constraints identified |
| 2 | YAGNI | Scope is challenged and confirmed or reduced |
| 3 | Research | Technical research is complete (or skipped if unnecessary) |
| 4 | Specify | Acceptance criteria and definition of done are written |
| 5 | Document | Feature spec is written to `docs/features/` |
| 6 | Stories | Stories are broken down and added to backlog |

### `/plan`

| # | Phase | Checkpoint written when |
|---|---|---|
| 0 | Arch Gate | stack.md is validated, TBD items checked against feature needs |
| 1 | Codebase Analysis | Relevant files, patterns, and dependencies are mapped |
| 2 | Write Plan | Plan document is written to `docs/plans/` |
| 3 | Review/Validate | Plan is reviewed for completeness and correctness |
| 4 | Update Backlog | Backlog is updated with plan reference |

### `/implement`

Phases are **dynamic** — they come from the plan document, not from the command. The checkpoint tracks whichever phases the plan defines.

| # | Phase | Checkpoint written when |
|---|---|---|
| 1..N | (from plan) | Phase verification passes (automated checks + manual confirmation if required) |

The phase names and count are read from the plan file at the start of implementation.

## Protocol

### On Command Start (Step 0)

Every checkpointed command runs this before anything else:

1. **If `--fresh` was passed:**
   - Delete `docs/checkpoints/<command>-*.md` matching the current item
   - Proceed as if no checkpoint exists

2. **Check for existing checkpoint:**
   - Look for `docs/checkpoints/<command>-<ID>.md`
   - If found, read it and show a resume summary:
     ```
     Resuming from checkpoint: docs/checkpoints/<command>-<ID>.md
     Last updated: <timestamp>
     Completed: Phase 0 (Decision Sync), Phase 1 (Capture)
     Resuming at: Phase 2 (Product Analysis)
     ```
   - Skip to the first phase with status `pending` or `in_progress`
   - Re-read any artifacts listed in the checkpoint to restore context

3. **If no checkpoint exists:**
   - Proceed normally from the beginning

### After Each Phase Completes

1. Update the checkpoint file:
   - Set the completed phase status to `done` with a timestamp
   - Set the next phase status to `in_progress` (if there is one)
   - Update the `updated` timestamp in frontmatter
   - Update `Current State` with a brief summary
   - Add any decisions to `Key Decisions`
   - Add any created files to `Artifacts Produced`

2. Write the file using the Write tool — always overwrite the full file (not Edit), since multiple sections change each time.

### On Successful Completion

When all phases are done:

1. Delete the checkpoint file
2. If the command produces a final commit (like `/implement`), bundle the checkpoint deletion into that commit
3. If no commit is produced, delete the file and note it:
   ```
   Checkpoint cleared: docs/checkpoints/<command>-<ID>.md
   ```

### On Failure or Interruption

If a phase fails (verification doesn't pass, blocker found):

1. Update the checkpoint with the failure state in `Current State`
2. Leave the phase as `in_progress` (not `done`)
3. The next session will resume at the failed phase with context about what went wrong

If the session is interrupted (context limit, user closes terminal):

- The last written checkpoint is the recovery point
- This is why checkpoints are written **after** each phase, not at the end — partial progress is preserved

## Directory Management

- Create `docs/checkpoints/` if it doesn't exist (with `.gitkeep`)
- Checkpoint files should be committed alongside the work they track — they're part of the project state
- Consider adding `docs/checkpoints/` to `.gitignore` if the team prefers not to track them in version control (this is a project-level decision, not a skill-level one)

## Guidelines

1. **Write checkpoints after phases, not during.** A phase is either done or not — no partial phase checkpoints.
2. **Keep `Current State` concise.** Two to three sentences max. The resuming session will re-read artifacts for detail.
3. **Capture decisions, not discussion.** `Key Decisions` records what was decided, not the deliberation.
4. **Always delete on success.** Stale checkpoints cause confusion. Clean up.
5. **Don't checkpoint trivial commands.** Only the five multi-phase commands use checkpoints. Single-step commands like `/commit` or `/review` don't need them.
