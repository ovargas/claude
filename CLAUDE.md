# Virtual Team Plugin — Contributor Guide

This is a multi-host development-agent plugin for Claude Code and Codex. It provides a virtual development team workflow: TDD, debugging, code review, backlog management, and proven workflow patterns.

## Repository Structure

```
commands/       — Slash commands (/flow, /implement, /commit, etc.)
skills/         — Skills loaded by commands (TDD, git-practices, etc.)
agents/         — Specialized sub-agents (pattern-finder, security-reviewer, etc.)
hooks/          — Platform hook scripts (session-start, run-hook.cmd)
examples/       — Example CLAUDE.md templates and stack-specific skills
tests/          — Static validation tests (frontmatter, refs, commands)
.claude-plugin/ — Claude Code plugin manifest
.codex-plugin/  — Codex plugin manifest
.codex/         — Codex installation and migration instructions
skills/workflow-* — Thin Codex workflow adapters that load canonical commands
.cursor-plugin/ — Cursor plugin manifest
.opencode/      — OpenCode plugin adapter
.codex/         — Codex installation instructions
```

## Conventions

- Commands, skills, agents, and Codex workflow adapters use YAML frontmatter with `name` and `description` fields
- Command names match their filename (kebab-case)
- Skills live in `skills/<name>/SKILL.md`
- Cross-references use root-relative paths (e.g., `skills/git-practices/SKILL.md`, not `.claude/skills/...`)
- The bootstrap skill is `virtual-team:skill-awareness` — it loads via SessionStart hook
- Files under `commands/` are canonical workflow specifications. Codex adapters must reference them rather than duplicate their bodies.
- Host-specific invocation and tool differences belong in `skills/codex-host-adaptation.md`, not in canonical workflow files.
- For detailed skill authoring rules (size budget, descriptions, reference files, review checklist), see `skills/skill-authoring/SKILL.md`

## Testing

```bash
npm test
```

Validates frontmatter, file references, and command references across all markdown files.
