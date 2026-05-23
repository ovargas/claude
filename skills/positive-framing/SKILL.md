---
name: positive-framing
description: Use when editing client-facing IDEA and PROPOSAL prose — reframes loss-framed phrases as gain-framed and enforces section-aware verb tense rules
allowed-tools: Read, Edit, Grep, AskUserQuestion
---

# Positive Framing

Use these rules when editing narrative prose in `/virtual-team:idea` and `/virtual-team:proposal` outputs. Reframe what the client *gains*, not what they *avoid losing*. Enforce one governing tense per section. Never touch the hard-exclusion blocks.

**Out of scope:** `/virtual-team:feature`, `/virtual-team:epic`, ADRs, plans, technical reviews. Those need literal negation to function.

## Framing rules

1. **Replace negation-of-loss with affirmation-of-gain.** Identify what the negation is protecting against; name the protected thing directly as a positive state. See `references/pattern-catalog.md` for 22+ seed transforms across 5 categories.
   - Before: "without throwing away the current code"
   - After: "leveraging your existing codebase"
2. **No double negations.** "Not uncommon" → "common". "Not without merit" → "has merit".
3. **Lead each major section with the gain**, not the escape. The first sentence of Executive Summary, Solution, and Scope of Work names a positive outcome.

**Wiebe exception:** preserve negation when it names a recognized pain the reader already feels ("you'll never miss a deadline again"). Acknowledging pain before dissolving it is gain-framing, not loss-framing.

## Tense rules

4. **Simple present** for capabilities, scope, methodology. "We deliver", "the engagement includes".
5. **Simple past** for case studies and credentials. "We built", "we reduced churn 30%".
6. **Simple future or present-as-future** for timelines. "Phase 1 begins June 3".
7. **Present perfect is conditional**, not banned:
   - **Allowed** when anchored by a concrete quantity, named entities, or `since [date]`: "we have helped 40+ companies", "since 2018, we have delivered 60+ engagements".
   - **Not allowed** when vague: "we have been delivering for years", "the team has worked with enterprises".
   - **Never** in present-perfect-continuous form (`has been -ing`, `have been -ing`).
   - **Mechanical heuristic:** if removing the present perfect and substituting simple past or simple present preserves the meaning, switch. If the sentence loses its continuing-relevance bridge, keep it.
8. **One governing tense per section.** Tense shifts only on genuine time-reference change. Track Record / Credentials is the one section where anchored present perfect is the *default*.

See `references/tense-by-section.md` for the section-by-section table.

## Voice rules

9. **Active voice in accountability statements.** "We deliver X by date Y", not "X will be delivered". Passive acceptable in policy lines ("Invoices are due net 30").
10. **Modal-verb audit.** Soft-flag `may/might/could/should/would` in client-facing sentences. Hard-flag stacked modals ("could potentially be considered").

## Hard exclusions — do not edit

- `/proposal` Not Included sections — exclusions require literal negation
- `/proposal` Risks / Assumptions / Dependencies — threat language is appropriate
- `/idea` Risks, Assumptions, and "Not Doing" sections
- Tables, code blocks, REQ IDs, cost figures, dates, structural bullet labels
- Frontmatter, headers, any markdown structural element

## Voice Profile interaction

When `/proposal` invokes this skill with a `--target-role` value, honor that profile's `**Words to avoid:**` list at `commands/proposal.md:497-541` even when the pattern catalog suggests a banned word. For example, the `cto` profile bans "leverage" — substitute "build on" or "extend" instead. Voice Profile constraints override catalog defaults.

## Application protocol

1. Identify section type (Executive Summary, Scope, Risks, Not Included, Track Record, etc.).
2. If the section is in the hard-exclusion list, return unchanged.
3. Apply framing rules 1-3, consulting `references/pattern-catalog.md` when a phrase resists direct transformation.
4. Apply tense rules 4-8, consulting `references/tense-by-section.md` for the section's governing tense.
5. Apply voice rules 9-10.
6. Cross-check every replacement against the active Voice Profile's forbidden-word list. If a replacement hits the list, choose an alternative or skip the transform.

## Integration

This skill is loaded by:
- `commands/proposal.md` — invoked as a pre-pass before the humanizer in the Editorial Pipeline
- `commands/idea.md` — invoked in Round 5 as the sole editorial pass
- `skills/skill-awareness/SKILL.md` — registered in the context-to-skill mapping
