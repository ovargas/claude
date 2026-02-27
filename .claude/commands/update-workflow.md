---
name: update-workflow
description: Update generic workflow files (commands, agents, skills) from the template repo into the current project
model: sonnet
---

# Workflow Update

You are updating a project's generic workflow files from the template repository. This command copies commands, agents, generic skills, and CLAUDE context files — without touching project-specific configuration.

## Invocation

**Usage patterns:**
- `/update-workflow` — interactive, asks for template source
- `/update-workflow --from=<path>` — update from a local directory (e.g., `--from=../claude-workflow`)
- `/update-workflow --from=<git-url>` — update from a git repository (clones to temp dir)
- `/update-workflow --dry-run` — show what would change without writing anything
- `/update-workflow --diff` — show a detailed diff of each file that would change

## What Gets Synced

### Generic files (overwritten from template)

These are the shared workflow files maintained in the template repo:

| Category | Files | Source |
|---|---|---|
| **Commands** | `.claude/commands/*.md` | All command files |
| **Agents** | `.claude/agents/*.md` | All agent definitions |
| **Generic skills** | `.claude/skills/{api-design,data-layer,git-practices,service-layer,ui-design}/` | The 5 domain-principle skills |
| **CLAUDE context** | `.claude/CLAUDE-service.md`, `.claude/CLAUDE-hub.md` | Repo-type context files |

### Project-specific files (never touched)

These belong to the project and are never overwritten:

| Category | Examples |
|---|---|
| **Project skills** | `.claude/skills/kotlin-spring-boot/`, `.claude/skills/react-vite/`, any skill not in the generic list |
| **Settings** | `.claude/settings.local.json` |
| **Project docs** | `stack.md`, `docs/`, `CLAUDE.md` |

## Process

### Step 0: Resolve Source

Determine where the template files come from.

1. **If `--from=<path>` is a local directory:**
   - Verify the path exists
   - Verify it has a `.claude/commands/` directory (sanity check)
   - Use it directly as the source

2. **If `--from=<git-url>` is a git URL:**
   - Clone to a temporary directory: `git clone --depth 1 --branch main <url> /tmp/claude-sync-template`
   - Use the cloned directory as the source
   - Clean up the temp directory when done

3. **If no `--from` provided:**
   - Use `AskUserQuestion` to ask:
     ```
     Where is the template repo?
     1. Local directory — provide a path (e.g., ../claude-workflow)
     2. Git repository — provide a URL
     ```
   - Then resolve as above

Verify the source looks like the template repo:
```bash
# Must have these directories
ls <source>/.claude/commands/
ls <source>/.claude/agents/
ls <source>/.claude/skills/
```

If any are missing, warn and ask whether to continue.

### Step 1: Inventory Changes

Compare source and target for every generic file. Build a change report with three categories:

- **Updated** — file exists in both, content differs
- **Added** — file exists in source but not in target
- **Unchanged** — file exists in both, content is identical

For each file, determine the category:

```
Generic commands:   compare <source>/.claude/commands/*.md → .claude/commands/*.md
Generic agents:     compare <source>/.claude/agents/*.md → .claude/agents/*.md
Generic skills:     compare <source>/.claude/skills/{api-design,data-layer,git-practices,service-layer,ui-design}/ → .claude/skills/*/
CLAUDE context:     compare <source>/.claude/CLAUDE-service.md → .claude/CLAUDE-service.md
                    compare <source>/.claude/CLAUDE-hub.md → .claude/CLAUDE-hub.md
```

Also detect:
- **Removed from template** — file exists in target commands/agents but NOT in source (template removed it). Flag these for the user to decide.
- **New project skills** — skills in the target that aren't in the generic list. List them as "preserved" for confirmation.

### Step 2: Present Report

Show the sync summary:

```
Sync from: <source path or URL>
Target:    <current project>

COMMANDS (N updated, N added, N unchanged)
  ✎ implement.md        — updated (checkpoint resume added)
  ✎ next.md             — updated
  + new-command.md       — new
  · commit.md            — unchanged
  ...

AGENTS (N updated, N added, N unchanged)
  · software-architect.md — unchanged
  ...

GENERIC SKILLS (N updated, N added, N unchanged)
  ✎ api-design/SKILL.md  — updated (layered skill loading)
  ...

CLAUDE CONTEXT (N updated, N unchanged)
  ✎ CLAUDE-service.md    — updated
  · CLAUDE-hub.md         — unchanged

PROJECT-SPECIFIC (preserved, not touched)
  ✔ skills/kotlin-spring-boot/
  ✔ skills/react-vite/
  ✔ settings.local.json
```

If `--dry-run` was passed, stop here.

If `--diff` was passed, also show the diff for each updated file (use `diff` command output).

### Step 3: Confirm and Apply

Ask for confirmation:

```
Apply N updates and N additions?
```

Options:
1. **Apply all** — copy all updated and added files
2. **Review each** — step through each change one at a time
3. **Cancel** — abort without changes

If "Apply all" or confirmed through "Review each":

1. Copy each updated/added file from source to target using the Write tool
2. Track what was written

If a file was "Removed from template", ask separately:
```
[filename] exists in your project but was removed from the template. Delete it?
```

### Step 4: Clean Up and Report

If a git URL was cloned, remove the temp directory.

Present the final report:

```
Sync complete.

Applied:
  ✎ N files updated
  + N files added
  · N files unchanged (skipped)
  ✔ N project-specific files preserved

No project-specific files were modified.
```

If the project is a git repo, suggest:
```
Review the changes with `git diff`, then `/commit` when ready.
```

## Important Guidelines

1. **NEVER touch project-specific skills.** The generic skill list is hardcoded: `api-design`, `data-layer`, `git-practices`, `service-layer`, `ui-design`. Everything else in `.claude/skills/` belongs to the project.

2. **NEVER touch `settings.local.json`.** This is project-specific configuration.

3. **NEVER touch `stack.md`, `docs/`, or `CLAUDE.md`.** These are project content, not workflow.

4. **Show before writing.** Always present the change report before modifying any files. The user must confirm.

5. **Preserve file structure.** Copy files maintaining the exact directory structure. Don't flatten or reorganize.

6. **Handle missing directories.** If the target doesn't have `.claude/agents/` yet, create it. Same for other directories.

7. **One-way sync.** This command only copies FROM the template TO the project. It never modifies the template.

8. **This command can be used to add new files that were introduced to the template.** This is why the command also tracks commands/agents that exist in source but not in target ("Added" category).
