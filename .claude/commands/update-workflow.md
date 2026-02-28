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
- `/update-workflow --ref=<branch|tag>` — use a specific branch or tag when cloning (default: `main`)
- `/update-workflow --dry-run` — show what would change without writing anything
- `/update-workflow --diff` — show a detailed diff of each file that would change

## What Gets Synced

### Generic files (overwritten from template)

These are the shared workflow files maintained in the template repo:

| Category | Files | Source |
|---|---|---|
| **Commands** | `.claude/commands/*.md` | All command files |
| **Agents** | `.claude/agents/*.md` | All agent definitions |
| **Generic skills** | `.claude/skills/{api-design,data-layer,git-practices,service-layer,ui-design,checkpoints}/` | The domain-principle skills |

### CLAUDE context files (merge with care)

`CLAUDE-service.md` and `CLAUDE-hub.md` contain both generic workflow structure AND project-customized sections (e.g., project-specific commands, custom behavioral expectations, skills tables with project entries). A full overwrite would wipe those customizations.

**Strategy:** When these files differ from the template, do NOT auto-overwrite. Instead:
1. Show the diff to the user
2. Present the update section-by-section (e.g., "Commands section changed", "Skills table changed")
3. Let the user accept or skip each section
4. If the user prefers, they can apply the full overwrite manually

**Identifying sections:** Use markdown `##` headings as section boundaries. Each `##` heading (e.g., `## Commands`, `## Skills`, `## Agents`) is a reviewable unit. Compare the template's section content against the target's section content. Sections that exist only in the template are "new sections to add." Sections that exist only in the target are "project customizations to preserve."

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
   - Clone to a temporary directory: `git clone --depth 1 --branch <ref> <url> /tmp/claude-sync-template`
     - `<ref>` comes from `--ref` flag if provided, otherwise defaults to `main`
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

If `.claude/.workflow-version` exists, read it and show:
```
Last sync: <synced timestamp>
Source: <source>
Ref: <ref>
Commit: <commit>
```
This helps the user understand what version they're currently on before seeing what changed.

Compare source and target for every generic file. Build a change report with three categories:

- **Updated** — file exists in both, content differs
- **Added** — file exists in source but not in target
- **Unchanged** — file exists in both, content is identical

For each file, determine the category:

```
Generic commands:   compare <source>/.claude/commands/*.md → .claude/commands/*.md
Generic agents:     compare <source>/.claude/agents/*.md → .claude/agents/*.md
Generic skills:     compare <source>/.claude/skills/{api-design,data-layer,git-practices,service-layer,ui-design,checkpoints}/ → .claude/skills/*/
CLAUDE context:     compare <source>/.claude/CLAUDE-service.md → .claude/CLAUDE-service.md  (section-by-section)
                    compare <source>/.claude/CLAUDE-hub.md → .claude/CLAUDE-hub.md            (section-by-section)
```

Also detect:
- **Target-only** — file exists in target commands/agents but NOT in source. This could mean the template removed it OR the project added a custom command. Do NOT assume deletion — flag it for the user to decide, and present it neutrally:
  ```
  ? deploy.md — exists locally but not in template (custom command or removed?)
  ```
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

CLAUDE CONTEXT (reviewed section-by-section)
  ⚠ CLAUDE-service.md    — differs (section-by-section review)
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

If a file is "Target-only", ask:
```
[filename] exists locally but not in template. Is this a custom project file (keep) or was it removed from the template (delete)?
```

### Step 4: Clean Up and Report

If a git URL was cloned, remove the temp directory.

Write the template version to `.claude/.workflow-version`:
```yaml
# Auto-generated by /update-workflow — do not edit manually
source: "<git-url or local path>"
ref: "<branch/tag used>"
synced: "<ISO 8601 timestamp>"
commit: "<source repo HEAD commit hash, if available>"
```

Present the final report:

```
Sync complete.

Applied:
  ✎ N files updated
  + N files added
  · N files unchanged (skipped)
  ✔ N project-specific files preserved

Workflow version recorded in .claude/.workflow-version
No project-specific files were modified.
```

If the project is a git repo, suggest:
```
Review the changes with `git diff`, then `/commit` when ready.
```

## Important Guidelines

1. **NEVER touch project-specific skills.** The generic skill list is hardcoded: `api-design`, `data-layer`, `git-practices`, `service-layer`, `ui-design`, `checkpoints`. Everything else in `.claude/skills/` belongs to the project.

2. **NEVER touch `settings.local.json`.** This is project-specific configuration.

3. **NEVER touch `stack.md`, `docs/`, or `CLAUDE.md`.** These are project content, not workflow.

4. **CLAUDE context files need section-level review.** `CLAUDE-service.md` and `CLAUDE-hub.md` mix generic workflow with project customizations. Never auto-overwrite — always show the diff and let the user accept or skip each section.

5. **Show before writing.** Always present the change report before modifying any files. The user must confirm.

6. **Preserve file structure.** Copy files maintaining the exact directory structure. Don't flatten or reorganize.

7. **Handle missing directories.** If the target doesn't have `.claude/agents/` yet, create it. Same for other directories.

8. **One-way sync.** This command only copies FROM the template TO the project. It never modifies the template.

9. **Track workflow version.** After every successful sync, write `.claude/.workflow-version` with the source, ref, timestamp, and commit hash. This lets future syncs show what changed since last update.

10. **This command can be used to add new files that were introduced to the template.** This is why the command also tracks commands/agents that exist in source but not in target ("Added" category).

11. **Self-update is safe.** If the template contains a newer version of `update-workflow.md` itself, it gets overwritten like any other command file. The current execution completes with the old version; the new version takes effect on the next run.
