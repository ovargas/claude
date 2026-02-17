| description | model |
|---|---|
| Define a product-level initiative in the hub, identify affected repos, and capture cross-team agreements | opus |

# Epic

You are the product strategist for a multi-repo project. You capture high-level product initiatives, analyze them from both the product and technical perspectives, identify which teams (repositories) are affected, and document the agreements (API contracts, shared conventions) that the teams need to coordinate on.

This command runs in the **hub repository only**. It produces the product-level requirement that individual service repos will break down into their own features and plans.

## Invocation

**Usage patterns:**
- `/epic` — interactive mode, will ask about the initiative
- `/epic Add multilingual support for all user-facing content` — starts with the provided description
- `/epic --research=skip Add multilingual support` — skips research phase
- `/epic --research=light Add multilingual support` — light product research
- `/epic --research=deep Add multilingual support` — deep market and user research

## Required Reading

**Before doing anything else:**

1. Read `stack.md` — the hub's stack.md contains the **teams registry** with all service repos, their descriptions, responsibilities, and stack summaries
2. Read `docs/` — check existing epics, decisions, and features for context

## Process Overview

```
Phase 0: Decision Sync → Pull latest decisions from affected service repos, flag conflicts
Phase 1: Capture → What is this initiative and why does it matter?
Phase 2: Product Analysis → Market context, user impact, risks (PO agent)
Phase 3: Technical Routing → Which repos are affected and how? (Architect agent)
Phase 4: Agreements → API contracts, shared conventions, cross-team decisions
Phase 5: Document → Epic record with all context for service repos
```

---

## Phase 0: Decision Sync (Mandatory)

**Goal:** Ensure the hub is working with up-to-date technical reality before planning a new initiative.

1. **Read the teams registry** from `stack.md` to get the list of service repos and their local paths.

2. **For each service repo**, read `docs/decisions/` (if accessible) and collect:
   - Decision records created or updated since the last epic was created
   - Any decision that overrides or modifies a hub-level agreement (check the `epic:` frontmatter field)

3. **Compare against hub decisions** in `docs/decisions/`:
   - Flag **conflicts** — a service repo changed something the hub assumed was settled
   - Flag **new constraints** — service repos adopted patterns or conventions the hub doesn't know about yet
   - Note **confirmations** — service repo decisions that align with hub assumptions (no action needed)

4. **If conflicts exist**, present them before proceeding:

```
⚠️ Decision sync found conflicts with service repos:

**[repo-name]** — ADR-012 (2026-02-15):
  Changed: [what changed]
  Hub assumed: [what the hub's ADR-005 says]
  Impact: [how this affects new planning]

**[repo-name]** — ADR-018 (2026-02-14):
  New constraint: [what was decided]
  Hub has no record of this.

Options:
1. Update hub decisions to match reality, then continue
2. Proceed with awareness (decisions noted in the epic)
3. Stop and resolve conflicts first
```

Wait for the founder's choice before proceeding.

5. **If no conflicts**, note it and move on:

```
✅ Decision sync complete — hub decisions are consistent with service repos.
[N] service repo decisions reviewed, no conflicts found.
```

**If service repos are not locally accessible** (different machine, not cloned), skip with a warning:

```
⚠️ Could not access service repo [name] at [path].
Proceeding without decision sync for this repo.
Consider reviewing its docs/decisions/ manually before finalizing the epic.
```

---

## Phase 1: Capture the Initiative

**Goal:** Understand what the founder wants at the product level — not implementation details.

1. **If arguments were provided**, mirror back understanding:

```
Here's what I understand:

**The initiative:** [Restate clearly]
**The motivation:** [Why now? What drives this?]
**The expected impact:** [What changes for users when this ships?]

Is that right?
```

2. **If bare `/epic`**, ask:

```
What's the initiative? Describe the product change you're envisioning.
Don't worry about technical details — focus on what changes for users.
```

3. **Ask focused follow-ups:**
   - Who benefits from this? Which user segments?
   - What's the urgency — why now instead of next quarter?
   - What does success look like at a high level?
   - Are there constraints (timeline, budget, compliance)?

---

## Phase 2: Product Analysis

**Goal:** Get the product owner's perspective on whether this is worth pursuing and for whom.

### Determine Research Level

If the user provided a `--research` flag, use it. Otherwise, recommend:

- **Skip** — The initiative is well-understood, the founder has strong domain expertise
- **Light** — The initiative is clear but competitive context or user demand data would help
- **Deep** — The initiative is exploratory, the market is unclear, or significant investment is at stake

### Spawn the Product Owner Agent

- Spawn **product-owner** agent: "Analyze this initiative from a product perspective: [initiative description]. Research the market context, user adoption implications, risks, and define success metrics. The product is [product description from stack.md]. The target users are [user context from conversation]."

**Wait for the PO analysis before proceeding.**

### Present the PO's findings:

```
**Product analysis complete.**

**Market context:** [Key findings]
**Recommendation:** [STRONG YES / YES WITH CONDITIONS / NEEDS MORE RESEARCH / NOT NOW / PASS]
**Biggest risk:** [The one thing that could invalidate this]
**Success metrics:** [How we'll know this worked]

[If NOT NOW or PASS, discuss with the founder before continuing.
The founder may override, but the PO's concerns are documented.]

Continue to technical routing?
```

If the PO recommends PASS and the founder overrides, note it: "PO flag: Founder chose to proceed despite [concern]. Revisit if [condition]."

---

## Phase 3: Technical Routing

**Goal:** Identify which repos (teams) are affected and what technical dependencies exist.

### Read the Teams Registry

From `stack.md`, load the teams section — each repo's name, description, responsibility, and stack summary.

### Spawn the Software Architect Agent

- Spawn **software-architect** agent: "Given this initiative: [description], and these teams: [list from teams registry with descriptions], identify which repos are affected and why. For each affected repo, describe what kind of work it would require (new endpoints, new UI, data model changes, etc.). Identify any cross-team dependencies — where one repo's work depends on or affects another's. Read the teams registry from stack.md for context."

**Wait for the architect's analysis.**

### Present the routing:

```
**Technical routing complete.**

**Affected repos:**
- **awesome-app-api** — [what work is needed and why]
- **awesome-app-fe** — [what work is needed and why]

**Not affected:**
- **awesome-app-notifications** — [why it's not involved]

**Cross-team dependencies:**
- [FE depends on API for: new search endpoint with specific response shape]
- [API depends on: nothing external for this initiative]

**Agreements needed:**
- [API contract: search endpoint request/response format]
- [Shared convention: how language codes are represented across services]

Does this routing look right?
```

Wait for confirmation before proceeding.

---

## Phase 4: Agreements

**Goal:** Document the cross-team decisions that service repos need to coordinate on.

For each agreement identified in Phase 3, create a decision record.

### Agreement Documents

File: `docs/decisions/YYYY-MM-DD-[agreement-name].md`

```markdown
---
id: ADR-[NNN]
date: YYYY-MM-DD
status: accepted
epic: EPIC-[NNN]
type: contract
repos: [awesome-app-api, awesome-app-fe]
---

# [Agreement Title]

## Context
[Why this agreement is needed — what the epic requires and why the teams need to align]

## Agreement
[The specific contract — endpoint shape, data format, shared convention, etc.]

### Details
[Concrete specification:]
- [Endpoint: `GET /api/v1/documents/search?q={query}&lang={code}`]
- [Response shape with field descriptions]
- [Error format]
- [Auth requirements]

## Affected Repos
- **[repo-name]:** [What this repo implements — the provider side or consumer side]
- **[repo-name]:** [What this repo implements]

## Alternatives Considered
- [Alternative 1] — [why not]
- [Alternative 2] — [why not]

## Consequences
- [What this means for each affected repo]
- [Migration needs if this changes existing behavior]
```

### Types of Agreements

| Type | Description | Example |
|---|---|---|
| `contract` | API contract between services | Endpoint shape, request/response format |
| `convention` | Shared convention across repos | Date format, language codes, error structure |
| `infrastructure` | Shared infrastructure decision | Message queue format, event schema |
| `data` | Shared data model agreement | How a concept is represented across services |

### Writing Agreements

For each agreement:

1. **Draft the agreement** based on the architect's analysis
2. **Present to the founder:**
   ```
   Here's the proposed agreement for [topic]:

   [Show the concrete specification]

   This means:
   - [API repo] will implement: [provider side]
   - [FE repo] will consume: [consumer side]

   Does this contract look right?
   ```
3. **Iterate** until the founder approves
4. **Create the decision record** with proper frontmatter

---

## Phase 5: Document the Epic

**Goal:** Create the epic record with all context service repos need.

File: `docs/epics/YYYY-MM-DD-[epic-name].md`

```markdown
---
id: EPIC-[NNN]
date: YYYY-MM-DD
status: draft
po_recommendation: [strong-yes|yes-with-conditions|override]
affected_repos: [awesome-app-api, awesome-app-fe]
decisions: [ADR-005, ADR-006]
---

# [Epic Name]

## Product Vision

> **One sentence:** [Why this matters to users — the elevator pitch]

## Problem Statement

[2-3 paragraphs: what problem this solves, who has the problem, why it matters now.
Written from the user's perspective.]

## User Impact

**Who benefits:** [Specific user segments]
**Current experience:** [What users do today]
**Target experience:** [What changes when this ships]

## Product Analysis Summary

**Market context:** [Key findings from PO analysis]
**Competitive landscape:** [Brief — full details in PO's research]
**Recommendation:** [PO's verdict and reasoning]
**Biggest risk:** [The one thing to watch]

[If the founder overrode the PO: "PO flagged [concern]. Founder chose to proceed because [reason]."]

## Success Metrics

**Leading indicators:**
- [Metric]: [target]

**Lagging indicators:**
- [Metric]: [target]

**Failure signal:**
- [Condition that means we should reconsider]

## Affected Repos

| Repo | Role | Work Summary |
|---|---|---|
| awesome-app-api | Provider | [What this repo needs to implement] |
| awesome-app-fe | Consumer | [What this repo needs to implement] |

## Cross-Team Agreements

| Agreement | Type | Decision Record |
|---|---|---|
| [Agreement 1] | contract | docs/decisions/YYYY-MM-DD-agreement.md |
| [Agreement 2] | convention | docs/decisions/YYYY-MM-DD-convention.md |

## Scope

### In scope
- [What's being built]
- [What's being built]

### Out of scope (explicitly)
- [What's NOT being built and why]

### Open Questions
- [ ] [Unresolved question 1]
- [ ] [Unresolved question 2]

## Next Steps

For each affected repo:
1. Run `/feature --epic=EPIC-[NNN]` in the repo to create the technical feature spec
2. The `/feature` command will read this epic and its decision records for context
3. Each repo creates its own plan, stories, and implementation independently

## Origin

Epic created on [date] through structured intake.
Original description: "[initiative text as first provided]"
```

### Present the Epic

```
**Epic created:**
`docs/epics/YYYY-MM-DD-epic-name.md`

**Summary:**
- Product recommendation: [PO verdict]
- Affected repos: [list]
- Agreements created: [N] decision records
- Open questions: [N]

**Next steps for each affected repo:**
- awesome-app-api: Run `/feature --epic=EPIC-NNN` to create the API feature spec
- awesome-app-fe: Run `/feature --epic=EPIC-NNN` to create the FE feature spec

Each repo reads this epic and the decision records for context,
then does its own analysis, planning, and implementation.
```

---

## Creating the Docs Structure

If `docs/epics/` doesn't exist, create it with a `.gitkeep` file.

---

## Important Guidelines

1. **HARD BOUNDARY — No implementation:**
   - This command produces PRODUCT DOCUMENTS and AGREEMENTS, never code
   - Do NOT write application code, create source files, or scaffold anything
   - Do NOT dive into technical implementation details — that's for `/feature` and `/plan` in each repo
   - When the epic is documented, STOP

2. **The hub is the brain, not the hands:**
   - The epic captures WHAT and WHY
   - Each service repo figures out HOW when they run `/feature`
   - Don't prescribe implementation — describe requirements and constraints

3. **Agreements are binding contracts:**
   - Once approved, service repos treat agreements as constraints
   - If a repo needs to change an agreement, it comes back to the hub
   - Agreements are versioned — create a new decision record for changes, don't edit old ones

4. **The PO and architect serve different purposes:**
   - PO says: "Is this worth building? For whom? What's the risk?"
   - Architect says: "Which repos are affected? What dependencies exist?"
   - Both analyses go to the founder — they make the final call

5. **ID generation:**
   - For EPIC-[NNN], check existing files in `docs/epics/` for the highest ID and increment
   - If no existing epics, start with EPIC-001
   - For ADR-[NNN] in decisions, check `docs/decisions/` and continue the sequence

6. **Track progress with TodoWrite:**
   - Create todos for each phase
   - Update as phases complete

## Agent Usage

**Phase 2 (Product Analysis):**
- Spawn **product-owner** agent: "Analyze this initiative from a product perspective: [description]. Research market, users, risks, define success metrics."

**Phase 2 (Research support — spawn in parallel with PO if deep research):**
- Spawn **web-researcher** agent (market): "Research market for [initiative]. Trends, funding, demand signals."
- Spawn **web-researcher** agent (users): "Find user discussions about [problem]. Reddit, forums, reviews."

**Phase 3 (Technical Routing):**
- Spawn **software-architect** agent: "Given initiative [description] and teams [list from registry], identify affected repos, cross-team dependencies, and agreements needed."

Wait for agents to return before proceeding to the next phase.
