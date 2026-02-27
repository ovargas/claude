---
name: checkpoints
description: Progress checkpointing for long-running commands. Load this skill in commands that run multiple phases and risk context window exhaustion — implement, debug, feature, plan, epic. Enables resume-after-clear and cleanup-on-completion.
model: sonnet
---

# Checkpoints

Long-running commands write progress to disk so they can resume after a context clear and clean up when done. This skill defines the checkpoint protocol.

## Checkpoint File

**Location:** `docs/checkpoints/<COMMAND>-<ID>.md`

Examples:
- `docs/checkpoints/implement-FEAT-007.md`
- `docs/checkpoints/debug-BUG-003.md`
- `docs/checkpoints/feature-FEAT-012.md`
- `docs/checkpoints/plan-S-005.md`
- `docs/checkpoints/epic-EPIC-002.md`

**Format:**
```markdown
---
command: implement
id: FEAT-007
branch: feat/CTR-12
started: 2026-02-15T10:30:00
updated: 2026-02-15T11:45:00
status: in-progress
current_phase: 3
total_phases: 5
---

# Checkpoint: /implement FEAT-007

## Completed Phases

### Phase 1: Database schema
- ✅ Created migration `20260215_add_tasks_table.sql`
- ✅ Added model `src/models/task.ts`
- Files touched: `src/models/task.ts`, `migrations/20260215_add_tasks_table.sql`

### Phase 2: API endpoints
- ✅ Added `POST /api/tasks` endpoint
- ✅ Added `GET /api/tasks/:id` endpoint
- Files touched: `src/routes/tasks.ts`, `src/services/taskService.ts`

## Current Phase

### Phase 3: Frontend components
- 🔄 Created `TaskList` component
- ⬜ Create `TaskDetail` component
- ⬜ Wire up API calls

## Remaining Phases

### Phase 4: Integration tests
### Phase 5: Documentation

## Key Context
- Feature spec: `docs/features/FEAT-007-task-management.md`
- Plan: `docs/plans/FEAT-007-plan.md`
- Branch: `feat/CTR-12`
- Stack: Node.js + React (from stack.md)
```

## Protocol

### On Command Start — Check for Existing Checkpoint

Before doing anything else, check if a checkpoint exists:

```
1. Look for `docs/checkpoints/<COMMAND>-<ID>.md`
2. If found:
   - Read it
   - Show the user:
     **Resuming from checkpoint:**
     Command: /implement FEAT-007
     Last updated: 2026-02-15 11:45
     Completed: Phase 1 (Database schema), Phase 2 (API endpoints)
     In progress: Phase 3 (Frontend components) — TaskList created, TaskDetail pending
     Remaining: Phase 4, Phase 5

     Picking up from Phase 3.
   - Skip completed phases entirely — do NOT re-read or re-do them
   - Resume from the current phase's first incomplete item
3. If not found:
   - Start fresh, create the checkpoint after completing the first phase
```

### During Execution — Write After Each Phase

After completing each phase:

1. Update the checkpoint file:
   - Move the completed phase to "Completed Phases" with a summary of what was done
   - List files touched in that phase
   - Update `current_phase` and `updated` in frontmatter
   - Write the next phase as "Current Phase"
2. Commit the checkpoint (lightweight, no noise):
   ```bash
   git add docs/checkpoints/<COMMAND>-<ID>.md
   git commit -m "checkpoint: <command> <id> — phase <N> complete"
   ```

### On Command Completion — Clean Up

When ALL phases are complete:

1. Delete the checkpoint file:
   ```bash
   rm docs/checkpoints/<COMMAND>-<ID>.md
   ```
2. Commit the deletion with the final work:
   ```bash
   git add -A
   git commit -m "<type>(<scope>): <message> [<ticket-id>]"
   ```
   The checkpoint removal is bundled into the final commit — no extra noise.

### On Error or Interruption

If the command fails or is interrupted:
- The checkpoint stays on disk — that's the whole point
- Next time the user runs the same command with the same ID, it picks up where it left off
- If the user wants to start over, they delete the checkpoint manually or run with `--fresh`

## Rules

1. **Checkpoint after phases, not after every step.** Don't write to disk after every file read. Write after meaningful milestones — completed phases, major sub-tasks.

2. **Keep checkpoints lean.** Record what was done and what files were touched. Don't dump full file contents or huge code blocks into the checkpoint.

3. **Completed phases are trusted.** When resuming, do NOT re-verify or re-implement completed phases. Trust the checkpoint. If something is wrong, the user can `--fresh` to start over.

4. **One checkpoint per command+ID pair.** If `/implement FEAT-007` is run, there's one checkpoint file. Running it again resumes. Running `/implement FEAT-008` creates a separate checkpoint.

5. **Checkpoints are committed.** They live in git so they survive across sessions, worktrees, and machines.

6. **`--fresh` flag.** All commands that use checkpoints should accept `--fresh` to delete any existing checkpoint and start from scratch.

7. **Cleanup is mandatory.** On successful completion, the checkpoint MUST be deleted. Leftover checkpoints signal incomplete work.

## Context Pre-flight

Before starting a heavy command, estimate context usage. If the conversation already has substantial history:

```
⚠️ Context usage is high. This command needs room to work.
Consider running /compact or /clear before proceeding.
Alternatively, this command supports checkpoints — if context runs out mid-work,
re-run the same command and it will resume from the last completed phase.
```

This is a suggestion, not a blocker — the command proceeds either way, but the user knows checkpoints will protect their progress.
