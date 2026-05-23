---
id: ADR-006
date: 2026-05-23
status: accepted
type: convention
---

# Editorial Pipeline: Two-Pass Order (Positive-Framing → Humanizer)

## Context

FEAT-027 introduces a `positive-framing` skill that rewrites loss-framed prose to gain-framed and audits verb tense by section. The pre-existing `humanizer` skill removes AI writing patterns and adjusts rhythm/word choice. Both edit narrative prose in `/virtual-team:proposal`. The research surfaced an alternative (Option B) of merging positive-framing rules into `humanizer` as additional rules. We rejected it and kept the skills separate, invoked sequentially.

## Decision

1. `/virtual-team:proposal` invokes editorial skills in a fixed order: **positive-framing first, then humanizer**. The order is documented in the `## Editorial Pipeline` section of `commands/proposal.md`.
2. When `--lang` is set, **both editorial passes run on the English source before translation.** Running either pass on translated prose produces worse target-language output.
3. `/virtual-team:idea` currently invokes only positive-framing — `humanizer` is not active for that command. The same English-before-translation invariant applies if `--lang` is added later.
4. Each pass is **scoped** to narrative-prose sections only. Tables, headers, factual bullet lists, Not Included, Risks, Assumptions, Dependencies, REQ IDs, cost figures, and dates are excluded from both passes.

## Alternatives Considered

- **Merge positive-framing rules into humanizer.** Rejected: violates ADR-001 size budget (humanizer is already 560 lines), mixes orthogonal concerns (polarity rewrite vs AI-tell removal), and forces re-testing of a stable skill every time framing rules change.
- **Run humanizer first, positive-framing second.** Rejected: humanizer's rhythm edits would fight gain-framing rewrites; reordering them after the fact loses the framing improvements.
- **Single combined pass behind a flag.** Rejected: same merge problem as the first alternative, plus surface-area inflation.

## Consequences

- Future editorial passes (e.g., a hypothetical `--style-guide` pass) plug into the Editorial Pipeline section using the same scope-guardrails pattern.
- A pass-fighting risk remains (humanizer rule #9 — Negative Parallelisms — overlaps with positive-framing rule #1). If manual proposal generation surfaces oscillation, the fallback is an explicit "skip humanizer rule #9 when positive-framing has already run" instruction at the invocation site. Documented in the FEAT-027 plan under Risks and Fallbacks.
- The `/idea` command's single-pass setup is intentional and not a gap. `humanizer` for `/idea` is a separate decision that has not been triggered by user feedback.
