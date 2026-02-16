| description | model |
|---|---|
| Pick up the next item from the backlog, lock it, create a worktree, and prepare for implementation | sonnet |

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

2. **Is there already work in Doing for THIS worktree?** If working from a worktree, check if this session's branch already has a lock. If yes:
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
   - If no plan exists, warn:
     ```
     This story doesn't have an implementation plan yet.
     Run `/plan FEAT-NNN` first to create one, or proceed without a plan (not recommended for complex work).
     ```
5. **Are there blocking dependencies?** Check if other stories are listed as prerequisites in the backlog.

### Step 4: Determine the Branch Name

Build the branch name from git-practices conventions:

1. **Type** — derive from the story:
   - New capability → `feat`
   - Bug fix → `fix`
   - Code restructuring → `refactor`
   - Maintenance → `chore`
2. **Ticket ID** — from the story's ticket reference (e.g., `CTR-12`)
3. **Branch name** → `<type>/<ticket-id>` (e.g., `feat/CTR-12`)

If the ticket ID isn't in the backlog, ask the founder.

### Step 5: Lock the Backlog Item (BEFORE creating the worktree)

**Important:** The lock must be committed BEFORE the worktree is created. This prevents a race condition where two concurrent `/next` calls pick the same item.

Create or update `docs/backlog.lock`:

```yaml
# Managed by /next and /pr commands — do not edit manually
locks:
  - item: "S-003"
    feature: "FEAT-007"
    branch: "feat/CTR-12"
    worktree: "../repo-worktrees/feat/CTR-12"
    started: "2026-02-12T14:30:00"
```

If the lockfile already exists with other entries, append the new lock — don't overwrite existing ones.

### Step 6: Update the Backlog and Commit

1. Move the item from Ready to Doing in `docs/backlog.md`:
   - Change `- [ ]` to `- [>]` (in-progress marker)
   - Add branch reference: `[>] S-003: Story title — `feat/CTR-12``

2. **Commit both the lock and backlog update together:**
   ```bash
   git add docs/backlog.lock docs/backlog.md
   git commit -m "chore(backlog): lock and start S-003 for feat/CTR-12"
   ```

This commit happens on the main branch so all worktrees can see it immediately.

### Step 7: Create the Worktree

Now that the item is locked, create the worktree safely:

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

### Step 8: Load Context

Gather everything the implementation session will need:

1. **Read the feature spec** that this story belongs to
2. **Read the implementation plan** if it exists
3. **Read any referenced research** documents
4. **Read any referenced decision** records

### Step 9: Present the Work (then STOP)

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

6. **Lock commit goes on main:**
   - The backlog.lock and backlog.md updates are committed on the main/default branch
   - This ensures all worktrees can pull and see the locks
   - The worktree is created AFTER the lock is committed
