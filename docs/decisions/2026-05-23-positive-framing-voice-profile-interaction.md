---
id: ADR-007
date: 2026-05-23
status: accepted
type: convention
---

# Positive-Framing Voice Profile Interaction: Uniform Application with Advisory Per-Profile Notes

## Context

FEAT-027 adds a `positive-framing` skill invoked by `/virtual-team:proposal`, which already exposes four Voice Profiles via `--target-role` (`cto`, `cfo`, `client`, `po`). Each profile has its own forbidden-word list and tone markers. During feature intake the founder explicitly chose "apply uniformly across audiences" over per-audience differentiation, but the `cto` profile bans words like "leverage" and "empower" that some catalog replacements would otherwise use. We needed a way to honor both constraints without forking the skill per profile.

## Decision

1. The `positive-framing` skill applies the **same catalog and rule set across all Voice Profiles**. There are no profile-specific patterns or profile-specific tense rules.
2. Each Voice Profile in `commands/proposal.md` gets a one-line `**Framing note:**` bullet (added after Tone markers, before Default length). The note is advisory — it tells the skill which catalog entries to prefer or skip, but adds no logic to the skill itself.
3. The skill **must honor the active profile's "Words to avoid" list** at runtime. If a catalog replacement contains a forbidden word, the skill picks an alternative replacement or skips the transform.
4. A static cross-check test (`tests/validate-positive-framing.test.ts`) parses the four forbidden-word lists from `commands/proposal.md:497-541` and asserts that no catalog replacement collides with any profile's list, unless the catalog entry is explicitly tagged `skip-for: <profile>`.

## Alternatives Considered

- **Per-profile rule variants** (Option A in research). Rejected: violates the founder's "apply uniformly" directive and quadruples the maintenance surface — every catalog update requires four edits.
- **Profile-specific pattern files** (Option C in research). Rejected: same problem as A, plus discoverability cost (which file owns which pattern?).
- **No profile awareness at all** (pure uniform application). Rejected: would silently produce `cto`-targeted documents containing "leverage" and "empower", regressing on an existing constraint the `cto` profile was created to enforce.

## Consequences

- Adding a new Voice Profile requires only a `**Framing note:**` bullet — no skill changes.
- Adding a new catalog pattern requires checking its replacement against all four profiles' forbidden-word lists. The static test enforces this automatically.
- A future contributor who wants to override the convention (e.g., add a profile-specific pattern) must either tag the pattern `skip-for: <profile>` and pick an alternative, or supersede this ADR.
- The `Framing note:` bullets are the single source of truth for profile-specific framing guidance. They live next to the rest of the profile definition, so a contributor updating the profile sees the framing constraint in the same edit.
