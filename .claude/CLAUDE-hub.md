# Hub Repository

This is a **hub repository** — the product brain. It holds epics, cross-team decisions, and coordinates service repos. No application code lives here.

## How This Repo Works

The hub captures WHAT to build and WHY. Service repos figure out HOW. Work flows like this:

```
/idea → /epic → (decisions + agreements) → service repos run /feature → /plan → /implement
```

The hub's job is done when an epic is documented and agreements are written. Each service repo takes it from there independently.

## Key Files

- **`stack.md`** — Product definition and teams registry. Read this first on every session. It lists all service repos with their roles, responsibilities, and stack summaries.
- **`docs/epics/`** — Product-level initiatives. Each epic describes what to build, which repos are affected, and links to cross-team agreements.
- **`docs/decisions/`** — Cross-team agreements (API contracts, conventions, data formats) and architectural decision records. These are binding — service repos treat them as constraints.
- **`docs/research/`** — Research outputs from `/idea` and `/epic` deep research phases.
- **`docs/backlog.md`** — Product backlog: Active, Next, Inbox.

## Agents

Eight specialized agents live in `.claude/agents/`. They are read-only sub-agents spawned by commands — they analyze and recommend, they don't write code or make final decisions. The founder decides.

| Agent | Role | When Used |
|---|---|---|
| **product-owner** | Product analysis — market, users, risk, value | `/idea` (deep), `/epic` (medium) |
| **software-architect** | Technical routing and dependency gatekeeper | `/epic` (routing), `/plan` (gate) |
| **web-researcher** | External research — market, competitors, users | `/idea`, `/epic`, `/research` |
| **codebase-locator** | Finds files by area or concern | `/feature`, `/plan` |
| **codebase-analyzer** | Traces data flow and system behavior | `/plan`, `/implement` |
| **pattern-finder** | Finds existing implementation patterns | `/plan`, `/feature` |
| **docs-locator** | Finds relevant docs, plans, decisions | `/feature`, `/plan` |
| **security-reviewer** | Reviews code for security concerns | `/review`, `/tech-review` |

## Commands

Commands are the workflow. Each one has a specific job and a hard boundary: pre-implementation commands produce documents, never code.

### Product Discovery
- `/idea` — Capture and shape a new product concept through structured interview
- `/research` — Deep-dive research on a specific topic

### Epic & Feature Flow
- `/epic` — Define a product initiative, identify affected repos, create cross-team agreements
- `/feature` — Spec out a feature (can be hub-level or driven by an epic)

### Planning & Implementation (for service repos)
- `/plan` — Create a technical implementation plan from a feature spec
- `/implement` — Execute the plan phase by phase with verification
- `/next` — Pick up the next backlog item, lock it, create a worktree

### Code Lifecycle
- `/commit` — Stage and commit following git conventions
- `/pr` — Create a pull request and release the backlog lock
- `/worktree` — Manage git worktrees (create, remove, list, clean)

### Quality & Maintenance
- `/review` — Code review
- `/tech-review` — Technical review of architecture or approach
- `/refine` — Iterate on an existing document
- `/bug` — Document a bug report
- `/debug` — Investigate and diagnose an issue
- `/status` — Show project status
- `/handoff` — Create a session handoff note for continuity

## Skills

Skills are domain-specific standards loaded by implementation commands. In the hub, they're mostly relevant for git operations:

- **git-practices** — Branch naming (`<type>/<ticket-id>`), commit format, PR format, worktree conventions, backlog lock format. Loaded by `/commit`, `/pr`, `/next`, `/worktree`.

The coding skills (`api-design`, `ui-design`, `data-layer`, `service-layer`) exist for service repos. They're loaded by `/implement` in those repos.

## Behavioral Expectations

1. **No code in the hub.** This repo produces documents: epics, decisions, research, backlogs. If you're tempted to write application code here, stop.
2. **YAGNI.** Don't spec features that solve hypothetical problems. Challenge every "what if."
3. **Founder decides.** Agents recommend, the founder chooses. Present reasoning clearly so they can agree or override.
4. **One question at a time.** Don't overwhelm with question barrages. Walk through things conversationally.
5. **TBD is valid.** If something hasn't been decided, mark it TBD. The software-architect will catch it when it matters.
6. **Decisions are documents.** Every non-obvious choice gets a decision record with id, date, status, and optional epic/type/repos frontmatter. Agreements between repos are separate decision documents, not inline in epics.
7. **Teams registry is the routing table.** When identifying which repos are affected by an epic, read the teams section of `stack.md` — it has each repo's role, responsibility, and stack.

## Multi-Repo Context

This hub coordinates service repos. Each service repo:
- Has its own `stack.md` with a `Hub` reference pointing back here
- Runs `/feature --epic=EPIC-NNN` to break down epics into repo-specific work
- Reads decisions from this hub's `docs/decisions/` as constraints
- Has its own backlog, plans, and implementation cycle
- Is autonomous — the hub doesn't dictate HOW to build, only WHAT and the cross-team contracts
