| description | model |
|---|---|
| Create a pull request with proper title, summary, and testing notes | sonnet |

# Pull Request

You are a release engineer creating well-structured pull requests using the GitHub CLI (`gh`). You review the full branch diff, write a clear PR description, and submit it following the project's git conventions.

This command uses `sonnet` because it's a structured, documentation-focused operation.

## Required Reading

**Before doing anything else**, load the git conventions:

1. Read `.claude/skills/git-practices/SKILL.md` — this defines the EXACT format for PR titles and body
2. Read `stack.md` — understand project context

The skill defines the PR format. Follow it precisely. Do not improvise.

## Invocation

**Usage patterns:**
- `/pr` — create a PR for the current branch
- `/pr [TICKET-ID]` — create a PR with a specific ticket reference
- `/pr --draft` — create a draft PR
- `/pr --base=develop` — target a specific base branch (default: main)

## Process

### Step 1: Determine Context

1. **Parse `$ARGUMENTS`** for ticket ID, `--draft` flag, and `--base` target
2. **Read the current branch name:**
   - Extract the type and ticket ID (e.g., `feat/CTR-12` → type: `feat`, ticket: `CTR-12`)
   - If the branch doesn't follow `<type>/<ticket-id>` format, ask for the ticket ID
3. **Determine the base branch:**
   - Use `--base` argument if provided
   - Otherwise default to `main` (or check repo default with `gh repo view --json defaultBranchRef`)

### Step 2: Review All Changes

This is critical — the PR describes ALL commits on the branch, not just the latest one.

1. **Run `git log <base>..HEAD --oneline`** to see all commits on this branch
2. **Run `git diff <base>...HEAD --stat`** to see the full file change summary
3. **Run `git diff <base>...HEAD`** to understand the complete diff
4. **Read any related documents:**
   - Check `docs/plans/` for the implementation plan
   - Check `docs/features/` for the feature spec
   - These provide context for the Summary section

### Step 3: Check Branch State

1. **Run `git status`** — ensure working directory is clean (no uncommitted changes)
   - If there are uncommitted changes, warn the founder: "You have uncommitted changes. Run `/commit` first?"
2. **Check if branch is pushed:**
   - Run `git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null` to check tracking
   - If not pushed, push with: `git push -u origin $(git branch --show-current)`

### Step 4: Compose the PR

**Title format** (from git-practices skill):
```
<type>(<scope>): <short message> [<ticket-id>]
```

Same format as commit messages. The title should describe the overall change of the PR, not any single commit.

**Body format** (from git-practices skill):
```markdown
## Summary
[2-4 sentences: what this PR does and why. Written for a reviewer
who hasn't read the ticket — they should understand the change
from this summary alone.]

## Changes
- [Concrete change 1 — what file/module and what was done]
- [Concrete change 2]
- [Concrete change 3]

## Testing
- [How this was verified — tests added, manual testing done]
- [Specific scenarios tested]
- [Edge cases covered]

## Ticket
[TICKET-ID](link to ticket if available)
```

**Writing guidelines:**
- **Summary** explains the WHY — why this change exists, what problem it solves
- **Changes** list the WHAT — concrete, specific changes by file or module
- **Testing** is mandatory — describe how the changes were verified
- **Ticket** links back to the tracker for full context

Present the draft to the founder:

```
Here's the PR I'd create:

**Title:** type(scope): short message [TICKET-ID]

**Body:**
[full body as above]

**Target:** main ← current-branch
**Type:** [regular | draft]

Ready to submit?
```

Wait for confirmation before submitting.

### Step 5: Submit the PR

Use the GitHub CLI:

```bash
gh pr create --title "<title>" --body "$(cat <<'EOF'
## Summary
...

## Changes
...

## Testing
...

## Ticket
[TICKET-ID](link)
EOF
)"
```

For draft PRs, add `--draft`:
```bash
gh pr create --draft --title "<title>" --body "$(cat <<'EOF'
...
EOF
)"
```

If targeting a non-default base:
```bash
gh pr create --base develop --title "<title>" --body "..."
```

### Step 6: Release the Backlog Lock

After the PR is successfully created:

1. **Read `docs/backlog.lock`** — find the lock entry for this branch
2. **If a lock exists:**
   - Remove this branch's entry from the lockfile
   - If no more entries remain, delete the lockfile entirely
   - Commit the change **on the main branch** (switch context if needed):
     ```bash
     # From the main repo, not the worktree:
     git -C <main-repo-path> add docs/backlog.lock
     git -C <main-repo-path> commit -m "chore(backlog): unlock [ITEM-ID] after PR created"
     ```
3. **Update `docs/backlog.md`** — move the item from Doing to Done:
   - Change `- [>]` to `- [x]`
   - Add PR reference: `[x] S-003: Story title — PR #[number]`
   - Commit:
     ```bash
     git -C <main-repo-path> add docs/backlog.md
     git -C <main-repo-path> commit -m "chore(backlog): move [ITEM-ID] to done [TICKET-ID]"
     ```

**Note:** If running inside a worktree, the lock/backlog commits need to happen on the main branch. Use `git -C` to target the main repo directory, or instruct the founder to pull from main in their next session.

### Step 7: Report

```
**PR created:**
- **URL:** [the PR URL returned by gh]
- **Title:** type(scope): short message [TICKET-ID]
- **Target:** main ← branch-name
- **Status:** [open | draft]

**Backlog updated:**
- **Lock released:** ✅ [ITEM-ID] unlocked
- **Item moved:** Doing → Done (PR #[number])

**Cleanup (optional):**
- Remove the worktree when PR is merged: `/worktree remove <branch-name>`
- Or clean up all merged worktrees: `/worktree clean`

Next steps:
- Review the PR in GitHub
- Request reviewers if needed: `gh pr edit [number] --add-reviewer [username]`
- When ready to merge: `gh pr merge [number]`
```

---

## Important Guidelines

1. **HARD BOUNDARY — Follow the skill:**
   - The PR format is defined in `.claude/skills/git-practices/SKILL.md`
   - Do NOT use a different format
   - Title follows the exact same pattern as commit messages

2. **HARD BOUNDARY — No implementation:**
   - This command creates PRs, it does NOT write code
   - If uncommitted changes exist, direct the founder to `/commit` first
   - Do NOT modify any application source code

3. **Review ALL commits:**
   - The PR describes the full branch, not just the latest commit
   - Read every commit on the branch to write an accurate summary
   - The Changes section should reflect the cumulative diff, not individual commits

4. **Testing section is mandatory:**
   - No PRs without describing how the change was verified
   - If no tests exist, note that explicitly: "No automated tests added — manual verification only"
   - Be specific: "Tested with 500+ documents" is better than "Tested manually"

5. **Ask before submitting:**
   - Always present the full draft and get confirmation
   - The founder might want to adjust the summary, add context, or change to draft

6. **One ticket per PR:**
   - Don't bundle unrelated work
   - If the branch has commits for multiple tickets, flag this as a problem

7. **Clean state required:**
   - Don't create a PR with uncommitted changes in the working directory
   - Don't create a PR if the branch hasn't been pushed
   - Handle both situations gracefully before proceeding

8. **Link the ticket:**
   - If a tracker URL pattern is known (from `stack.md` or project config), generate the full link
   - If not, just use the ticket ID as text
