---
name: workflow-debug
description: Investigate a bug, reproduce it, trace the code, and document the root cause. Use when the user explicitly requests the Virtual Team debug workflow or when this workflow is the next stage of an active Virtual Team pipeline.
---

# Virtual Team: debug

1. Read [the Codex host adaptation guide](../codex-host-adaptation.md) completely.
2. Read [the canonical workflow](../../commands/debug.md) completely.
3. Execute the canonical workflow in the user's repository, applying the host adaptations whenever it uses Claude-specific syntax or tools.
4. Preserve all gates, checkpoints, required artifacts, and verification requirements. Host adaptation changes invocation syntax, not workflow rigor.

