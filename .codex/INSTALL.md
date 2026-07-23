# Installing Virtual Team for Codex

Virtual Team supports Codex through a native plugin manifest and Codex workflow Skills. The earlier skill-symlink installation remains documented below only for migration.

## Native installation

### Prerequisites

- Codex CLI or the Codex desktop app
- Git

### Install

```bash
codex plugin marketplace add ovargas/virtual-team
codex plugin add virtual-team@virtual-team
```

Restart the Codex app after installation and use a new task so Codex discovers the plugin components.

### Verify

```bash
codex plugin list
```

The result should include `virtual-team`. In a new task, request a workflow explicitly:

```text
Use virtual-team:workflow-status to inspect this repository.
```

### Update

```bash
codex plugin marketplace upgrade virtual-team
codex plugin add virtual-team@virtual-team
```

Start another new task after reinstalling so updated Skills are loaded.

## How compatibility works

- `.codex-plugin/plugin.json` is the Codex-native manifest.
- `skills/` contains shared coding and engineering practices.
- `skills/workflow-*` exposes every canonical workflow as a Codex Skill without colliding with Claude slash-command names.
- `commands/` remains the canonical workflow source used by Claude Code.
- `skills/codex-host-adaptation.md` maps Claude-specific invocation and tools to Codex without changing workflow gates.
- Claude Code continues to use `.claude-plugin/`, `commands/`, `agents/`, and `hooks/` unchanged.

## Migrating from the legacy symlink installation

If `~/.agents/skills/virtual-team` points to this repository, remove only that symlink or Windows junction after installing the plugin. Do not remove the repository itself.

macOS or Linux:

```bash
rm ~/.agents/skills/virtual-team
```

Windows PowerShell:

```powershell
Remove-Item "$env:USERPROFILE\.agents\skills\virtual-team"
```

Restart Codex and use a new task. Removing the old link avoids duplicate Skill discovery.

## Local development

When testing an unpublished checkout, add a local marketplace that points to the checkout or use the Codex plugin-development cachebuster workflow. Validate the plugin before reinstalling:

```bash
python3 /path/to/plugin-creator/scripts/validate_plugin.py /path/to/virtual-team
```
