---
name: workflow-flow-fix-pipeline
description: Run the internal bug-fix pipeline used by the flow workflow. Use when the user explicitly requests the Virtual Team flow-fix-pipeline workflow or when this workflow is the next stage of an active Virtual Team pipeline.
---

# Virtual Team: flow-fix-pipeline

1. Read [the Codex host adaptation guide](../codex-host-adaptation.md) completely.
2. Read [the canonical workflow](../../commands/flow-fix-pipeline.md) completely.
3. Execute the canonical workflow in the user's repository, applying the host adaptations whenever it uses Claude-specific syntax or tools.
4. Preserve all gates, checkpoints, required artifacts, and verification requirements. Host adaptation changes invocation syntax, not workflow rigor.

