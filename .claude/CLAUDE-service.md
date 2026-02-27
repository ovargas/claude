# Service Repository

This is a **service repository** — an implementation repo. It has its own codebase, backlog, features, plans, and decisions. It builds software.

## How This Repo Works

Work flows through a deliberate pipeline. Each step produces a specific artifact. No step is skipped.

```
/feature → /plan → /next → /implement → /pr
```

- `/feature` captures WHAT to build (with YAGNI challenge)
- `/plan` creates HOW to build it (with architectural gate)
- `/next` picks up the work, locks it, creates a worktree — backlog: `[ ]` → `[>]`
- `/implement` executes the plan phase by phase with verification — backlog: `[>]` → `[=]`
- `/pr` auto-commits, creates the PR, and releases the lock — backlog: `[=]` → `[x]`

If this service is part of a multi-repo product, features can be driven by hub epics (`/feature --epic=EPIC-NNN`), which brings in cross-team decisions as constraints.

## Key Files

- **`stack.md`** — Tech stack definition. Read this first on every session. Contains language, framework, folder structure, database, API style, config approach, and all TBD items. If a `Hub` reference exists, this repo is part of a multi-repo product.
- **`docs/features/`** — Feature specs. Each one describes a feature, its YAGNI assessment, scope, definition of done, and story breakdown.
- **`docs/plans/`** — Implementation plans. Step-by-step technical instructions with file references, patterns to follow, and verification commands.
- **`docs/decisions/`** — Local architectural decision records. Non-obvious technical choices made for this repo.
- **`docs/backlog.md`** — Service backlog with four states: `[ ]` Ready, `[>]` Doing, `[=]` Implemented, `[x]` Done.
- **`docs/backlog.lock`** — Lockfile preventing two worktrees from picking the same item. Managed by `/next` and `/pr`.
- **`docs/proposals/`** — Business proposals generated from ideas or features.
- **`docs/research/`** — Research outputs.
- **`docs/checkpoints/`** — Progress checkpoints for long-running commands. Auto-created during execution, auto-deleted on completion. If a file exists here, the command was interrupted mid-work.
- **`docs/handoffs/`** — Session handoff notes for continuity across sessions.
- **`docs/bugs/`** — Bug reports.

## Agents

Eight specialized agents live in `.claude/agents/`. They are sub-agents spawned by commands — they analyze and recommend, they don't make final decisions.

| Agent | Role | When Used |
|---|---|---|
| **software-architect** | Gatekeeper (halts on missing decisions) + architectural recommendations | `/plan` Phase 0 (mandatory), `/feature` |
| **product-owner** | YAGNI sanity check for repo-level features | `/feature` Phase 2 (light check) |
| **codebase-locator** | Finds files by area or concern | `/feature`, `/plan` |
| **codebase-analyzer** | Traces data flow and system behavior | `/plan`, `/implement` |
| **pattern-finder** | Finds existing implementation patterns to follow | `/plan`, `/feature`, `/implement` |
| **docs-locator** | Finds relevant docs, plans, decisions | `/feature`, `/plan` |
| **web-researcher** | External research — libraries, APIs, patterns | `/research`, `/feature` |
| **security-reviewer** | Reviews code for security concerns | `/review`, `/tech-review` |

### The Architect as Gatekeeper

The software-architect agent has a special role: it runs a **dependency check** before any plan is written. It reads `stack.md`, identifies TBD items, and cross-references them against the feature's requirements. If the feature needs something that hasn't been decided (e.g., database is TBD but the feature needs queries), it **halts** the entire planning process with options and recommendations. This is not optional — it prevents building on unresolved foundations.

## Commands

Commands are the workflow. Pre-implementation commands produce documents, never code. Only `/implement` writes code.

### Feature Intake
- `/idea` — Capture a new product concept (for standalone repos without a hub)
- `/feature` — Spec a feature with YAGNI challenge, research, and story breakdown
- `/feature --epic=EPIC-NNN` — Spec a feature driven by a hub epic (reads epic + decisions as constraints)

### Planning & Analysis
- `/plan` — Create a technical implementation plan. Phase 0 runs the architect gate automatically.
- `/research` — Deep-dive research on a specific topic or technical question
- `/proposal` — Business proposal from an idea or feature — scope, timeline, infrastructure, costs

### Implementation Cycle
- `/next` — Pick the next backlog item, lock it, create a worktree, load context
- `/implement` — Execute the plan phase by phase with verification, marks backlog `[=]` on completion
- `/pr` — Auto-commits pending changes, creates PR, releases lock, marks backlog `[x]`. Use `--manual` to review first.
- `/commit` — Stage and commit following git conventions (auto by default, `--manual` to review)

### Git Workflow
- `/worktree` — Manage git worktrees (create, remove, list, clean)

### Quality & Maintenance
- `/review` — Code review
- `/tech-review` — Technical review of architecture or approach
- `/refine` — Iterate on an existing document
- `/bug` — Document a bug report
- `/debug` — Investigate and diagnose an issue, updates backlog if tracked
- `/docs` — Generate project documentation (setup guides, config references, runbooks)
- `/status` — Show project status (detects `[=]` items pending PR)
- `/handoff` — Create a session handoff note for continuity

## Skills

Skills are domain-specific coding standards. `/implement` loads the relevant skill before writing code for each phase.

| Skill | Domain | Loaded When |
|---|---|---|
| **git-practices** | Branch naming, commits, PRs, worktrees, backlog lock | `/commit`, `/pr`, `/next`, `/worktree` |
| **api-design** | API endpoints, route handlers, middleware, validation | Working on routes, controllers, API code |
| **ui-design** | Frontend components, pages, hooks, styling, state | Working on `.tsx`, `.jsx`, `.css`, frontend dirs |
| **data-layer** | Database schemas, migrations, models, repositories, queries | Working on models, migrations, DB code |
| **service-layer** | Business logic, services, domain rules, orchestration | Working on services, use cases, domain logic |
| **checkpoints** | Progress checkpointing for long-running commands | `/implement`, `/debug`, `/feature`, `/plan`, `/epic` |

Skills contain conventions — not code templates. The implementation plan points to existing codebase patterns. Skills ensure the new code follows the same standards.

## Git Conventions

These are defined in the `git-practices` skill. Summary:

- **Branches:** `<type>/<ticket-id>` — e.g., `feat/CTR-12`, `fix/CTR-45`
- **Commits:** `<type>(<scope>): <short message> [<ticket-id>]` with a mandatory description body
- **PRs:** Same title format as commits. Body has Summary, Changes, Testing, Ticket sections. Testing is mandatory.
- **Worktrees:** Sibling `{repo}-worktrees/` directory. Create with `git wt <branch>`, remove with `git wtr <branch>`. One worktree per ticket.
- **Backlog lock:** `docs/backlog.lock` prevents two worktrees from picking the same item. Created by `/next`, released by `/pr`. Stays active through the `[=]` Implemented state until the PR ships.

## Behavioral Expectations

1. **Follow the pipeline.** Feature → Plan → Implement → PR. Don't skip steps. Don't start coding without a plan.
2. **YAGNI is not optional.** Challenge every "what if" and "while we're at it." Three lines of duplicated code beats a premature abstraction.
3. **The plan is the source of truth.** During `/implement`, follow the plan. Don't add features, refactor adjacent code, or "improve" things the plan doesn't mention.
4. **Verify at every boundary.** Run the verification commands at each phase end. Don't skip them.
5. **TBD items are the architect's trigger.** If `stack.md` has TBD items that a feature needs, the architect halts. Resolve them, update `stack.md`, create decision records, then re-run.
6. **Founder decides.** Agents recommend, the founder chooses. Present reasoning and options.
7. **One question at a time.** Don't overwhelm with question barrages.
8. **Respect the backlog states.** `[ ]` Ready → `[>]` Doing → `[=]` Implemented → `[x]` Done. Never re-implement a `[=]` or `[x]` item. Never pick a locked item.
9. **Skills before code.** Load the relevant domain skill before writing code in `/implement`. The skill has the coding standards for that layer.
10. **Lightweight by default.** All commands run with zero agents unless `--deep` is passed. `/commit` and `/pr` auto-proceed without prompts unless `--manual` is passed.

## Hub Context (if applicable)

If `stack.md` has a `Hub` field pointing to a sibling hub repository:

- The hub holds epics (`docs/epics/`) and cross-team decisions (`docs/decisions/`)
- When running `/feature --epic=EPIC-NNN`, the command reads the hub's epic and its decision records
- Hub decisions (API contracts, data conventions) are **constraints** — they're the agreed interface, not suggestions
- This repo tracks which hub decisions affect its features via frontmatter: `epic` and `hub_decisions` fields in feature specs
- This repo's own `docs/decisions/` holds local technical decisions. Hub decisions live in the hub.
