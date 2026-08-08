---
name: grounded-claims
description: Use when stating any fact about the codebase, a dependency, or prior work — separates verified claims from recalled ones so wrong premises are visible before decisions are built on them
---

# Grounded Claims

## Overview

`virtual-team:verification-before-completion` gates what you claim **after** doing work. This skill gates what you assert **before and during** it — the premises that plans, decisions, and code get built on.

**The failure mode:** a recalled fact and a verified fact look identical in prose. Both arrive as confident statements. The founder cannot tell which one to double-check, so a wrong premise propagates into a plan, then into code, and is discovered three steps later — or not at all.

The fix is not "never answer from memory." It is: **make the source visible, and verify anything a decision rests on.**

## The Two-Tier Rule

### Tier 1 — Label every unverified claim (always, cheap)

Any factual claim you have not confirmed in **this session** carries an inline marker:

```
The retry logic lives in the API client (unverified — from training, not checked in this repo)
The plugin loads that hook at startup (unverified — prior session, not re-checked)
```

A verified claim cites its evidence instead — `file:line`, a quoted snippet, or command output:

```
Retries are configured at src/api/client.ts:44 — `retries: 3, backoff: 'exponential'`
```

No marker and no citation is not permitted for claims in scope. Silence about provenance is the bug.

### Tier 2 — Verify every load-bearing claim (before use, no exceptions)

A claim is **load-bearing** if any of these is true:

- A code change, plan step, or command you are about to produce assumes it
- Correcting it later would mean redoing work already done
- The founder may act on it — approve a plan, pick an approach, change a config

Load-bearing claims must be verified **before** you build on them, even when you are confident, and even when verification costs a tool call.

**Tiebreaker: if you cannot tell whether a claim is load-bearing, treat it as load-bearing.** The cost of an unnecessary Read is seconds. The cost of an unnoticed wrong premise is a wrong path.

## Scope — Three Sources, All Covered

| Source | Why it goes stale | What verifies it |
|--------|-------------------|------------------|
| **This repo** — files, config, structure, behavior | It changed since you last looked, or you never looked | `Read` / `Grep` in this session, cited by `file:line` |
| **External libraries and APIs** — defaults, signatures, behavior | Versions move; the training cutoff does not | The installed source, lockfile, or `WebFetch` of current docs |
| **Memory files and prior sessions** — recalled facts | True when written, not necessarily now | Re-confirm against the live artifact before use |

Memory files and earlier-session findings are **leads, not evidence**. They tell you where to look. They do not tell you what is true now.

## What Counts as Verified

- **Verified** = you observed it with your own tool call in this session, and can quote or cite it
- **Not verified** = "it typically works this way", "the convention is", "I recall", "that's standard for this framework", a teammate agent said so without a citation
- A sub-agent's report counts only if it carries the `file:line` evidence its own Evidence Discipline block requires

## Reporting Uncertainty

"I don't know, and here's what would tell us" is a complete, acceptable answer. Never close a gap with a plausible-sounding guess to make an explanation feel finished — that is the exact behavior this skill exists to prevent.

See `skills/grounded-claims/references/rationalizations.md` for the excuses that precede an ungrounded claim, and worked before/after examples.

## Integration

Loaded by:
- `virtual-team:skill-awareness` — always-on summary, active in ad-hoc sessions with no slash command
- `/virtual-team:implement` — Layer 0 (behavioral discipline)
- `/virtual-team:plan` — before proposing an approach that rests on how existing code works
- `/virtual-team:debug` — before naming a root cause
- `/virtual-team:research` — before reporting a finding

Related: `virtual-team:verification-before-completion` (claims about work status), the `Evidence Discipline` blocks in `agents/*.md` (claims made by delegated readers).
