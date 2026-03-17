---
name: next
description: Pick up the next item from the backlog, lock it, create a worktree,
and prepare for implementation
model: sonnet
---

# Next

You are a work dispatcher — you find the next thing to work on, lock the item to prevent conflicts, create a worktree for the work, load the context, and prepare the session for implementation. You don't implement anything yourself. You get everything ready so `/implement` can run smoothly.

This command uses the `sonnet` model because it's a read-and-organize operation.

## Required Reading

**Before doing anything else**, load the conventions:

1. Read `.claude/skills/git-practices/SKILL.md` — this defines branch naming, worktree conventions, and backlog lock format
2. Read `stack.md` — understand which service this repo represents

## Invocation

**Usage patterns:**
- `/next` — pick the highest-priority ready item for this repo's service
- `/next S-005` — pick a specific story by reference
- `/next backend` — pick the next item tagged for a specific service
- `/next FEAT-003` — pick the next unfinished story from a specific feature
- `/next --auto` — pick highest-priority item without asking, skip all prompts
- `/next --here` — work on the current branch, skip worktree creation
- `/next --current` — skip branch AND worktree creation, work on whatever branch you're on now

**Flags:**
- `--auto` — autonomous mode: automatically pick the highest-priority ready item, skip the "continue in-progress or pick new" choice (always picks new if nothing is in Doing for this worktree, continues in-progress if something is), and skip all confirmations. Use this for Ralph Wiggum loops or batch processing.
- `--here` — skip worktree creation and work directly on the current branch. Creates the feature branch in the current repo instead of a separate worktree. Useful for simple features, solo work, or repos where worktrees aren't practical. The lock still applies — parallel work just happens on branches instead of worktrees.
- `--current` — skip both worktree AND branch creation. Work on the current branch as-is — no checkout, no new branch. The backlog item is still locked and tracked, but no git branching ceremony happens. Useful for solo work where you want to just pick stories and implement them sequentially on the same branch. You can keep running `/next --current` to pick up stories one by one until the feature is done.

Flags combine: `/next --auto --current` picks the highest-priority item on the current branch and skips all prompts.

## Process

### Step 1: Read the Backlog

1. **Read `docs/backlog.md`** fully.
2. **Read `stack.md`** to understand which service this repo represents (backend, frontend, etc.).
3. **Read `docs/backlog.lock`** if it exists — identify what's already locked by other worktrees.
4. **If a specific item was requested** (story ID, feature ID, or service filter), locate it.
5. **If bare `/next`**, find the first item in the Ready section that:
   - Matches this repo's service tag
   - Is NOT locked in `backlog.lock`

### Step 2: Clean Stale Locks

Before picking an item, check the health of existing locks in `docs/backlog.lock`:

For each lock entry, check if it's stale:
1. **PR merged?** Run `gh pr list --head <branch> --state merged` — if the PR was merged, the lock and backlog update should have landed with it. If the lock is still present, it means main hasn't pulled the merged changes yet.
   - Run `git pull` to get the latest main (which should include the backlog update from the merged PR)
   - If the lock disappears after pull, it was correctly cleaned up by the PR merge
   - If the lock persists after pull (edge case — PR was merged but lock commit was missing), remove it
2. **Worktree gone?** Check if the worktree path still exists
3. **Branch deleted?** Run `git branch --list <branch>` and `git ls-remote --heads origin <branch>`

If any stale locks are found, clean them up automatically and report:
```
Cleaned up stale locks:
- S-003 (feat/CTR-12) — PR merged, lock released
- S-008 (fix/CTR-45) — branch deleted, lock released
```

Commit the cleanup if changes were made:
```bash
git add docs/backlog.lock docs/backlog.md
git commit -m "chore(backlog): clean stale locks"
```

### Step 3: Validate the Item

Before picking up the item, check:

1. **Is the item already locked?** Check `docs/backlog.lock`:
   - If locked by another worktree (and the lock is not stale — verified in Step 2), skip it and report:
     ```
     S-003 is already being worked on:
     - Branch: feat/CTR-12
     - Worktree: ../repo-worktrees/feat/CTR-12
     - Started: 2026-02-12T14:30:00

     Moving to the next available item...
     ```

2. **Is there already work in Doing or Implemented for THIS worktree?** Check if this session's branch already has a lock. If yes, check the backlog marker:

   **If the item is `[=]` (Implemented, pending PR):**

   **If `--auto`:** Skip the choice — run `/pr` to submit the completed work. Do not pick a new item when there's implemented work waiting for a PR.

   **If NOT `--auto`:**
   ```
   You have completed work waiting for a PR:
   - [Item] — branch: feat/CTR-12 — implemented, pending PR

   Options:
   1. Submit it now (run `/pr`)
   2. Park it and pick up [new item] instead

   What would you like to do?
   ```

   **If the item is `[>]` (Doing, implementation in progress):**

   **If `--auto`:** Skip the choice — run `/implement` to continue the in-progress work. Do not pick a new item when there's already work in progress for this worktree.

   **If NOT `--auto`:**
   ```
   You already have work in progress:
   - [Item in Doing] — branch: feat/CTR-12

   Options:
   1. Continue the in-progress work (run `/implement` directly)
   2. Park it and pick up [new item] instead

   What would you like to do?
   ```

3. **Does this story have a parent feature spec?** If yes, read it.
4. **Does this story have an implementation plan?** Check `docs/plans/` for a plan that covers this story.
   - If no plan exists:
     - **If `--auto`:** Note the missing plan but proceed — the Ralph Wiggum loop prompt should handle running `/plan --auto` before `/implement`.
     - **If NOT `--auto`:** Warn:
       ```
       This story doesn't have an implementation plan yet.
       Run `/plan FEAT-NNN` first to create one, or proceed without a plan (not recommended for complex work).
       ```
5. **Are there blocking dependencies?** Check if other stories are listed as prerequisites in the backlog.

### Step 4: Determine the Branch Name

**If `--current` was passed:** Skip branch name generation entirely. Use the current branch as-is:
```bash
git branch --show-current
```
Record the current branch name for the lock entry and proceed to Step 5.

**Otherwise**, build the branch name from git-practices conventions:

1. **Type** — derive from the story:
   - New capability → `feat`
   - Bug fix → `fix`
   - Code restructuring → `refactor`
   - Maintenance → `chore`
2. **Ticket ID** — from the story's ticket reference (e.g., `CTR-12`)
3. **Branch name** → `<type>/<ticket-id>` (e.g., `feat/CTR-12`)

If the ticket ID isn't in the backlog, ask the founder.

### Step 5: Lock the Backlog Item

Create or update `docs/backlog.lock`:

```yaml
# Managed by /next and /pr commands — do not edit manually
locks:
  - item: "S-003"
    feature: "FEAT-007"
    branch: "feat/CTR-12"
    worktree: "../repo-worktrees/feat/CTR-12"  # or "in-place" if --here, or "current-branch" if --current
    started: "2026-02-12T14:30:00"
```

If the lockfile already exists with other entries, append the new lock — don't overwrite existing ones.

**Commit the lock (mode-aware):**

- **Default or `--here` mode:** Commit the lock on main BEFORE creating the branch. This ensures all worktrees can see the lock immediately and prevents race conditions.
  ```bash
  git add docs/backlog.lock
  git commit -m "chore(backlog): lock S-003 for feat/CTR-12"
  ```

- **`--current` mode:** Commit the lock on the current branch. No switching to main — `--current` is for solo sequential work where cross-worktree coordination isn't needed.
  ```bash
  git add docs/backlog.lock
  git commit -m "chore(backlog): lock S-003 for feat/CTR-12"
  ```

**Important:** Only the lock file is committed here — NOT the backlog status change. The status update happens on the feature branch (Step 7) so it merges with the PR.

### Step 6: Create the Branch (worktree, in-place, or current)

**If `--current` was passed** — do nothing. No branch creation, no worktree. Work continues on the current branch. Skip to Step 7.

**If `--here` was passed** but NOT `--current` — create a branch in-place:

1. **Create and switch to the feature branch:**
   ```bash
   git checkout -b <branch-name>
   ```

2. **Verify the branch:**
   ```bash
   git branch --show-current
   ```

No worktree is created. Work happens directly in the current repo directory.

**If neither `--here` nor `--current` (default)** — create a worktree:

1. **Check we're in the main repo directory** (not inside a worktree already):
   ```bash
   git rev-parse --git-common-dir
   ```

2. **Create the worktree:**
   ```bash
   git wt <branch-name>
   ```

3. **Verify it was created:**
   ```bash
   git worktree list
   ```

4. **Determine the worktree path:**
   ```
   ../{repo}-worktrees/<branch-name>
   ```

### Step 7: Update the Backlog (on the feature branch)

Now that you're on the feature branch (or the current branch for `--current`):

1. Move the item from Ready to Doing in `docs/backlog.md`:
   - Change `- [ ]` to `- [>]` (in-progress marker)
   - Add branch reference: `[>] S-003: Story title — `feat/CTR-12``

2. **Commit the backlog update on the feature branch:**
   ```bash
   git add docs/backlog.md
   git commit -m "chore(backlog): start S-003 [TICKET-ID]"
   ```

**Why on the feature branch, not main:** The backlog status change merges with the code when the PR lands. This means main's backlog only reflects completed work — items stay as `[ ]` (Ready) on main until the PR merges. The lock file (committed on main in Step 5) prevents other worktrees from picking up the same item.

**For `--current` mode with sequential stories:** Each `/next --current` call adds another `[>]` marker on the feature branch. When the single PR merges, all story status changes land on main together.

### Step 8: Load Context

Gather everything the implementation session will need:

1. **Read the feature spec** that this story belongs to
2. **Read the implementation plan** if it exists
3. **Read any referenced research** documents
4. **Read any referenced decision** records

### Step 9: Present the Work (then STOP)

**If using a worktree (default):**

```
**Next up:** [Story title]
**From feature:** [Feature name] (FEAT-NNN)
**Service:** [backend|frontend|etc.]
**Ticket:** [TICKET-ID]

**Branch:** feat/CTR-12
**Worktree:** ../repo-worktrees/feat/CTR-12

**What to build:**
[Acceptance criteria from the story]

**Plan reference:** [docs/plans/... or "No plan — consider running /plan first"]

**Context loaded:**
- Feature spec: [path]
- Implementation plan: [path]
- Research: [path or "none"]
- Related decisions: [path or "none"]

**Backlog lock:** ✅ Item locked for this branch

**Next steps:**
1. Open a new Claude Code session in the worktree directory:
   `cd ../repo-worktrees/feat/CTR-12`
2. Run `/implement` to start building
```

**If using `--here` (in-place branch):**

```
**Next up:** [Story title]
**From feature:** [Feature name] (FEAT-NNN)
**Service:** [backend|frontend|etc.]
**Ticket:** [TICKET-ID]

**Branch:** feat/CTR-12 (current directory)

**What to build:**
[Acceptance criteria from the story]

**Plan reference:** [docs/plans/... or "No plan — consider running /plan first"]

**Context loaded:**
- Feature spec: [path]
- Implementation plan: [path]
- Research: [path or "none"]
- Related decisions: [path or "none"]

**Backlog lock:** ✅ Item locked for this branch

**Next steps:**
Run `/implement` to start building
```

**If using `--current` (no branch creation):**

```
**Next up:** [Story title]
**From feature:** [Feature name] (FEAT-NNN)
**Service:** [backend|frontend|etc.]
**Ticket:** [TICKET-ID]

**Branch:** [current branch name] (unchanged)

**What to build:**
[Acceptance criteria from the story]

**Plan reference:** [docs/plans/... or "No plan — consider running /plan first"]

**Context loaded:**
- Feature spec: [path]
- Implementation plan: [path]
- Research: [path or "none"]
- Related decisions: [path or "none"]

**Backlog lock:** ✅ Item locked (current branch mode)

**Next steps:**
Run `/implement` to start building
When done, run `/next --current` again to pick up the next story.
```

---

## Important Guidelines

1. **HARD BOUNDARY — No implementation:**
   - This command PREPARES for work, it does not DO the work
   - Do NOT write code, create files, or modify the codebase (except backlog and lock files)
   - Do NOT start implementing even if the task seems simple
   - When context is loaded and the worktree is ready, STOP

2. **One item at a time:**
   - Only pick up one story per `/next` invocation
   - If the founder wants to pick up more, they run `/next` again

3. **Respect the lock:**
   - Never pick an item that's locked by another worktree
   - Always create a lock before marking an item as Doing
   - The lock and backlog update are committed to git so all worktrees see them

4. **Respect the priority order:**
   - The order in the backlog is the priority
   - Don't skip items unless they're locked, blocked, or the founder specifically requests something else

5. **Fail gracefully:**
   - If the backlog is empty: "Nothing in the Ready column. Run `/status` to see the full picture, or `/feature` to spec something new."
   - If no items match the service filter: "No ready items for [service]. There are [N] items for other services."
   - If all items are locked: "All ready items are currently locked by other worktrees. Run `/worktree list` to see active work."
   - If `docs/backlog.md` doesn't exist: "No backlog found. Create one with `/feature` (which adds stories automatically) or create `docs/backlog.md` manually."
   - If `git wt` alias isn't available: "Git worktree alias `git wt` not found. Create the worktree manually: `git worktree add ../{repo}-worktrees/<branch> -b <branch>`"

6. **Lock goes on main, backlog status goes on the feature branch:**
   - The `backlog.lock` is committed on main (for default/here modes) so all worktrees can see locks
   - The `backlog.md` status change (`[ ]` → `[>]`) is committed on the feature branch so it merges with the PR
   - For `--current` mode, both lock and status go on the current branch (solo sequential work, no main switching)
   - The worktree/branch is created AFTER the lock is committed on main
