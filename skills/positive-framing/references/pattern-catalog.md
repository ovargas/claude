# Pattern Catalog — Seed Transforms

22 seed transforms grouped into five categories. Each entry: the loss-framed phrase, the gain-framed replacement, and a preservation note when the negation should be kept.

**These are defaults to break deliberately, not absolute rules.** Preserve negation when it names a recognized pain the reader already feels (Wiebe's Copyhackers exception).

**Voice Profile cross-check:** if a replacement contains a word on the active profile's forbidden-word list (`commands/proposal.md:497-541`), pick an alternative. Profile-aware notes are flagged inline as `skip-for: <profile>`.

## 1. Code and technical continuity

| Loss-framed | Gain-framed | Notes |
|---|---|---|
| without throwing away the current code | building on your existing codebase | `skip-for: cto` if "leverage" was the candidate — prefer "build on" |
| without rewriting from scratch | extending what you've already built | |
| without breaking existing integrations | preserving every integration in place | |
| without disrupting the current deployment | shipping alongside the current deployment | |
| no need to migrate everything at once | progressive cutover, one service at a time | |

## 2. Team and workflow continuity

| Loss-framed | Gain-framed | Notes |
|---|---|---|
| without retraining the team | familiar to your team from day one | |
| without changing the developers' workflow | keeping the current workflow intact | |
| no learning curve | productive from week one | |
| without adding process overhead | fits inside the current process | |

## 3. Risk and reliability

| Loss-framed | Gain-framed | Notes |
|---|---|---|
| to avoid downtime | with continuous uptime | Preserve in Risks sections |
| won't break production | safe for production from day one | Preserve in Risks sections |
| no surprises | predictable from start to finish | |
| without compromising security | with security validated at every step | Preserve in compliance/threat-framed sections |

## 4. Cost and scope

| Loss-framed | Gain-framed | Notes |
|---|---|---|
| without overspending | within a fixed $X budget | `skip-for: cfo` if replacement is vague — anchor to a number |
| no hidden costs | every cost named up front | |
| without scope creep | scope locked at signing | |
| no surprise change orders | every change estimated before work begins | |

## 5. Delivery and outcomes

| Loss-framed | Gain-framed | Notes |
|---|---|---|
| without delays | on the agreed schedule | |
| won't miss the deadline | delivered by [date] | |
| no missed milestones | every milestone tracked weekly | |
| you'll never miss a deadline again | every deadline tracked and surfaced before it slips | **Preserve original** when used after a recognized-pain acknowledgment (Wiebe exception) |
| no manual intervention needed | runs autonomously after handoff | `skip-for: cto` if "seamless" was the candidate |
| without falling behind competitors | shipping ahead of the category | Preserve in competitive-threat narratives |

## Transformation template (catalog miss)

When no catalog entry matches:

1. Identify what the negation is protecting against. ("Without X" protects against X.)
2. Name the protected state directly as a positive condition.
3. If you cannot name a positive state, the negation is naming a recognized pain — preserve it.
4. Cross-check the result against the active Voice Profile's forbidden-word list.

Example walkthrough:
- Input: "without exposing internal APIs to the public internet"
- Protected thing: internal APIs stay private
- Gain-framed: "with internal APIs kept on the private network"
- Check forbidden words: clear for all profiles
