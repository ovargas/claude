# Claude Code Virtual Team

A `.claude/` configuration library that turns Claude Code into a virtual development team for solo founders. It provides agents (specialized sub-agents), commands (workflow steps), and skills (coding standards) that enforce a deliberate pipeline from idea to shipped code.

This library is designed to be copied into your repositories. It supports two repo types: a **hub** (product brain) and **service** repos (implementation hands).

## Prerequisites

- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI installed
- [GitHub CLI](https://cli.github.com/) (`gh`) installed and authenticated
- Git configured with worktree aliases (see Git Setup below)

### Git Setup

The library expects two global aliases for worktree management. Add them to your `~/.gitconfig`:

```gitconfig
[alias]
    wt = "!f() { \
        REPO_NAME=$(basename $(git rev-parse --show-toplevel)); \
        WORKTREE_DIR=\"../$(echo $REPO_NAME)-worktrees/$1\"; \
        if git show-ref --verify --quiet refs/heads/$1 2>/dev/null; then \
            git worktree add \"$WORKTREE_DIR\" $1; \
        else \
            git worktree add -b $1 \"$WORKTREE_DIR\"; \
        fi \
    }; f"
    wtr = "!f() { \
        REPO_NAME=$(basename $(git rev-parse --show-toplevel)); \
        git worktree remove \"../$(echo $REPO_NAME)-worktrees/$1\"; \
    }; f"
```

This creates worktrees in a sibling directory:

```
my-app-api/                  ← main branch (your repo)
my-app-api-worktrees/        ← worktrees live here
  feat/CTR-12/
  fix/CTR-45/
```

## File Structure

```
.claude/
├── CLAUDE-hub.md            ← CLAUDE.md template for hub repos
├── CLAUDE-service.md        ← CLAUDE.md template for service repos
├── agents/                  ← 8 specialized sub-agents
│   ├── product-owner.md     ← Market, users, risk, value analysis
│   ├── software-architect.md ← Architecture + dependency gatekeeper
│   ├── web-researcher.md    ← External research (market, tech, users)
│   ├── codebase-locator.md  ← Finds files by area or concern
│   ├── codebase-analyzer.md ← Traces data flow and system behavior
│   ├── pattern-finder.md    ← Finds existing implementation patterns
│   ├── docs-locator.md      ← Finds relevant docs, plans, decisions
│   └── security-reviewer.md ← Security review of code changes
├── commands/                ← 18 workflow commands
│   ├── idea.md              ← Capture a new product concept
│   ├── epic.md              ← Hub-level initiative with cross-team agreements
│   ├── feature.md           ← Spec a feature with YAGNI challenge
│   ├── research.md          ← Deep-dive research
│   ├── plan.md              ← Technical implementation plan
│   ├── next.md              ← Pick up work, lock it, create worktree
│   ├── implement.md         ← Execute plan phase by phase
│   ├── commit.md            ← Git commit following conventions
│   ├── pr.md                ← Pull request + release lock
│   ├── init.md              ← Initialize repo (hub or service)
│   ├── worktree.md          ← Manage git worktrees
│   ├── review.md            ← Code review
│   ├── tech-review.md       ← Architecture review
│   ├── refine.md            ← Iterate on existing documents
│   ├── bug.md               ← Document a bug report
│   ├── debug.md             ← Investigate and diagnose issues
│   ├── status.md            ← Project status briefing
│   └── handoff.md           ← Session continuity notes
└── skills/                  ← 5 domain-specific standards
    ├── git-practices/       ← Branch, commit, PR, worktree conventions
    ├── api-design/          ← API endpoint and route handler standards
    ├── ui-design/           ← Frontend component and styling standards
    ├── data-layer/          ← Database, migration, query standards
    └── service-layer/       ← Business logic and service standards
```

## Setting Up a Hub Repo

The hub is the product brain. It holds epics, cross-team decisions, and coordinates service repos. No application code lives here.

### Step 1: Create the repo and copy the library

```bash
mkdir my-app-hub && cd my-app-hub
git init

# Copy the .claude directory from this library
cp -r /path/to/this-library/.claude .

# Use the hub CLAUDE.md template
cp .claude/CLAUDE-hub.md CLAUDE.md
```

### Step 2: Initialize

Start a Claude Code session and run:

```
/init --hub
```

This walks you through:
- Product identity (name, description, target users, stage)
- Teams registry (each service repo's name, path, role, responsibility, stack summary)

It creates:
- `stack.md` — product definition with teams registry
- `docs/epics/` — for product initiatives
- `docs/decisions/` — for cross-team agreements
- `docs/research/` — for research outputs
- `docs/reviews/` — for tech review outputs
- `docs/backlog.md` — product backlog (Active / Next / Inbox)

### Step 3: Commit the setup

```bash
git add -A
git commit -m "chore(init): initialize hub repository"
```

## Setting Up a Service Repo

A service repo is an implementation repo — API, frontend, mobile, etc. It has its own codebase, backlog, and development cycle.

### Step 1: Create the repo and copy the library

```bash
mkdir my-app-api && cd my-app-api
git init

# Copy the .claude directory from this library
cp -r /path/to/this-library/.claude .

# Use the service CLAUDE.md template
cp .claude/CLAUDE-service.md CLAUDE.md

# Remove hub-only template (optional, keeps things clean)
rm .claude/CLAUDE-hub.md
```

### Step 2: Initialize

Start a Claude Code session and run:

```
/init --service
```

This walks you through:
- Hub reference (path to the hub repo, if applicable)
- Language, runtime, package manager
- Framework, project structure, folder conventions
- Database, ORM, migrations, cache
- API style, auth, external services
- Configuration, environments, secrets
- Testing, linting, CI/CD
- Deployment, containers, build/run commands

Anything you haven't decided yet is marked TBD. The software architect will catch it later when a feature actually needs it.

It creates:
- `stack.md` — tech stack definition with TBD tracking
- `docs/features/` — for feature specs
- `docs/plans/` — for implementation plans
- `docs/decisions/` — for local architectural decision records
- `docs/research/` — for research outputs
- `docs/handoffs/` — for session continuity notes
- `docs/bugs/` — for bug reports
- `docs/reviews/` — for tech review outputs
- `docs/backlog.md` — service backlog (Doing / Ready / Inbox)

### Step 3: Commit the setup

```bash
git add -A
git commit -m "chore(init): initialize service repository"
```

## Keeping the Library in Sync

If you have multiple service repos, the `.claude/` directory is the same across all of them. You can share it via:

- **Git submodule**: Point `.claude/` to this library repo. Update all repos by pulling the submodule.
- **Manual copy**: Copy `.claude/` when creating new repos. Sync manually when commands or agents change.
- **Template repo**: Use this library as a GitHub template repository.

The only repo-specific file is `CLAUDE.md` at the root (copied from the appropriate template). Everything else in `.claude/` is generic.

## The Full Workflow

Here is the complete lifecycle from product idea to shipped code, showing which repo each step runs in and what it produces.

### Phase 1: Product Discovery (Hub)

```
Hub repo:
  /idea Build a task management app for remote teams
    → Structured interview about the problem, users, risks
    → Product owner agent researches market and competition
    → Output: docs/features/2026-02-12-task-management-app.md (IDEA-001)
    → Added to docs/backlog.md in Inbox
```

### Phase 2: Epic Definition (Hub)

```
Hub repo:
  /epic Add real-time collaboration to task boards
    → Phase 1: Capture the initiative (what, why, for whom)
    → Phase 2: Product owner analyzes market context, risks, success metrics
    → Phase 3: Software architect reads teams registry, identifies affected repos
    → Phase 4: Create cross-team agreements (API contracts, conventions)
    → Phase 5: Document the epic
    → Output:
        docs/epics/2026-02-15-realtime-collaboration.md (EPIC-001)
        docs/decisions/2026-02-15-websocket-api-contract.md (ADR-001, type: contract)
        docs/decisions/2026-02-15-event-format-convention.md (ADR-002, type: convention)
```

### Phase 3: Feature Breakdown (Service Repo)

```
Service repo (my-app-api):
  /feature --epic=EPIC-001
    → Reads hub epic and its decision records (ADR-001, ADR-002) as constraints
    → Phase 1: Understand what this repo needs to implement
    → Phase 2: YAGNI check (skipped for epic-driven — PO already assessed)
    → Phase 3: Research codebase patterns and technical feasibility
    → Phase 4: Define scope, definition of done, success metrics
    → Phase 5: Write feature spec
    → Phase 6: Break into stories
    → Output:
        docs/features/2026-02-16-websocket-backend.md (FEAT-001)
        Stories added to docs/backlog.md in Ready column
```

### Phase 4: Planning (Service Repo)

```
Service repo (my-app-api):
  /plan FEAT-001
    → Phase 0: Software architect runs dependency check against stack.md
      ✅ Pass — all TBD items resolved (or)
      ⛔ HALT — "Database: TBD, need to choose before proceeding"
    → Phase 1: Codebase analysis (locator, analyzer, pattern-finder agents)
    → Phase 2: Write step-by-step plan with file references and verification
    → Phase 3: Review and validate
    → Output: docs/plans/2026-02-16-websocket-backend.md
```

#### What Happens When the Architect Halts

```
Service repo (my-app-api):
  /plan FEAT-001
    → Phase 0: Architect checks stack.md
    → ⛔ HALT — WebSocket library: TBD, Caching: TBD
    → Presents options with recommendations:
        Decision 1: WebSocket library — gorilla/websocket vs nhooyr/websocket vs gobwas/ws
        Decision 2: Cache layer — Redis vs in-memory
    → You decide, update stack.md, create decision records
    → Re-run /plan FEAT-001
    → ✅ Architect passes, planning continues
```

### Phase 5: Implementation (Service Repo, in a Worktree)

```
Service repo (my-app-api), on main branch:
  /next
    → Reads backlog, finds first Ready item (S-001)
    → Checks backlog.lock — not locked by another worktree
    → Creates lock in docs/backlog.lock
    → Moves S-001 from Ready to Doing in backlog.md
    → Commits lock + backlog update on main
    → Creates worktree: git wt feat/CTR-12
    → Loads context (feature spec, plan, decisions)
    → Output: "Open a new session in ../my-app-api-worktrees/feat/CTR-12"

New terminal, in the worktree:
  cd ../my-app-api-worktrees/feat/CTR-12
  claude   ← start new Claude Code session

  /implement
    → Reads the plan
    → Phase 1: Data model & migration — writes code, runs verification
    → Phase 2: Business logic & service — writes code, runs verification
    → Phase 3: API endpoint — writes code, runs verification
    → Phase 4: Integration tests — writes code, runs verification
    → Final verification: all tests pass, lint clean, build succeeds
    → Output: working code, all checks green
```

### Phase 6: Ship (Service Repo, in the Worktree)

```
Worktree session (../my-app-api-worktrees/feat/CTR-12):
  /commit
    → Reads git-practices skill
    → Extracts ticket ID from branch: feat/CTR-12 → CTR-12
    → Stages changes, writes commit message:
      feat(websocket): implement real-time task updates [CTR-12]
    → Commits

  /pr
    → Reviews ALL commits on the branch
    → Composes PR title and body (Summary, Changes, Testing, Ticket)
    → Presents draft for review
    → After confirmation: gh pr create
    → Releases backlog lock on main
    → Moves item from Doing to Done in backlog.md
    → Output: PR URL, cleanup suggestions
```

### Phase 7: Cleanup

```
Back in main repo directory:
  /worktree clean
    → Finds worktrees where PR is merged
    → Removes them after confirmation
    → Cleans up stale locks
```

## Quick Flows

### Solo feature (no hub, single repo)

For a standalone service repo without a hub:

```
/feature Add password reset via email     ← spec + stories
/plan FEAT-001                            ← technical plan (architect gates)
/next                                     ← lock + worktree
  ↓ new session in worktree
/implement                                ← write code
/commit                                   ← commit
/pr                                       ← ship + unlock
```

### Morning startup

```
/status                                   ← what's in progress, what's next
/next                                     ← or continue existing work
  ↓
/implement --phase=3                      ← resume from where you left off
```

### Ending a session

```
/handoff                                  ← captures exact state for next session
```

### Investigating a bug

```
/bug Users can't reset password if email has uppercase letters
/debug                                    ← investigate root cause
/feature --ticket=BUG-042                 ← if fix needs a spec
```

### Multi-repo feature driven by an epic

```
Hub:
  /epic Add multilingual support
    → creates EPIC-001
    → creates ADR-003 (language code convention)
    → creates ADR-004 (translation API contract)

API repo:
  /feature --epic=EPIC-001                ← reads epic + ADR-003, ADR-004
  /plan FEAT-001
  /next → /implement → /commit → /pr

Frontend repo:
  /feature --epic=EPIC-001                ← reads same epic + agreements
  /plan FEAT-001
  /next → /implement → /commit → /pr
```

Both repos work independently but respect the shared agreements from the hub.

### Parallel work with worktrees

```
Terminal 1 (main branch):
  /next                  ← picks S-001, locks it, creates worktree A

Terminal 1 (main branch, again):
  /next                  ← picks S-002 (S-001 is locked), creates worktree B

Terminal 2 (worktree A):
  /implement             ← working on S-001

Terminal 3 (worktree B):
  /implement             ← working on S-002 in parallel
```

The `backlog.lock` file on main prevents both from picking the same item.

## Command Reference

| Command | Where | What It Does | Produces |
|---------|-------|-------------|----------|
| `/init` | Any | Initialize repo structure and stack | `stack.md`, `docs/` |
| `/idea` | Any | Capture and shape a product concept | Feature brief |
| `/epic` | Hub | Define cross-team initiative | Epic + decision records |
| `/feature` | Service | Spec a feature with YAGNI check | Feature spec + stories |
| `/research` | Any | Deep-dive research | Research document |
| `/plan` | Service | Technical implementation plan | Plan with file references |
| `/next` | Service | Pick work, lock, create worktree | Locked item + worktree |
| `/implement` | Worktree | Execute plan phase by phase | Working code |
| `/commit` | Worktree | Stage and commit | Git commit |
| `/pr` | Worktree | Create PR, release lock | Pull request |
| `/worktree` | Service | Manage worktrees | Create/remove/list/clean |
| `/review` | Any | Code review | Review feedback |
| `/tech-review` | Any | Architecture review | Review document |
| `/refine` | Any | Iterate on a document | Updated document |
| `/bug` | Service | Document a bug | Bug report |
| `/debug` | Service | Investigate an issue | Diagnosis |
| `/status` | Any | Project status briefing | Status report |
| `/handoff` | Any | Session continuity note | Handoff document |
| `/docs` | Any | Generate project documentation | Setup guides, config references, runbooks |

## Command Options

Many commands support flags to customize behavior:

### Global Options

#### `--auto` — Autonomous Mode
Skip confirmations and manual pause points. Use for automated workflows or "Ralph Wiggum loops" (repeated execution patterns).

**Available in:**
- `/plan --auto FEAT-007` — auto-approve the plan without asking
- `/implement --auto` — skip manual pause points between phases
- `/next --auto` — automatically pick highest-priority item without prompts

Flags can be combined: `/plan --auto --deep FEAT-007`

#### `--deep` — Agent-Powered Mode
Spawn specialized research agents for thorough analysis. Without this flag, commands use direct tools (Glob, Grep, Read, WebSearch) — faster and cheaper.

**Available in:**
- `/idea --deep` — spawn product-owner and web-researcher agents
- `/epic --deep` — spawn product-owner and software-architect agents
- `/feature --deep` — spawn agents for codebase analysis and web research
- `/research --deep` — spawn agents based on research scope
- `/plan --deep` — spawn software-architect and codebase-analyzer agents
- `/implement --deep` — allow agent spawning when plan lacks context

**When to use:** Complex features touching multiple modules, introducing new dependencies, or requiring deep codebase tracing.

### Command-Specific Options

#### `/init` Options
- `--hub` — initialize as a hub repository (product brain)
- `--service` — initialize as a service repository (implementation)
- `--from=../path` — bootstrap from another repo's stack.md
- `--minimal` — create structure only, skip the interview

#### `/feature` Options
- `--epic=EPIC-NNN` — create feature driven by a hub epic
- `--ticket=PROJ-123` — pull context from an external tracker ticket
- `--deep` — spawn agents for research (default: direct tools)

#### `/epic` Options
- `--deep` — spawn product-owner and architect agents (default: direct analysis)

#### `/research` Options
- `--scope=market|technical|codebase` — limit research to a specific domain
- `--deep` — spawn specialized research agents (default: direct WebSearch/Grep/Read)

#### `/plan` Options
- `--auto` — skip confirmations, auto-approve the plan
- `--deep` — spawn agents for architectural gate and codebase analysis
- `--story=S-003` — plan a specific story instead of full feature

#### `/implement` Options
- `--auto` — skip manual pause/confirmation points (still runs all automated verification)
- `--deep` — allow agent spawning when plan doesn't provide enough context
- `--phase=N` — resume from a specific phase after a session break
- `--story=S-005` — implement a specific story

#### `/next` Options
- `--auto` — automatically pick highest-priority item, skip all prompts
- Can also specify:
  - Story ID: `/next S-005` — pick a specific story
  - Service: `/next backend` — pick next item for a specific service
  - Feature: `/next FEAT-003` — pick next unfinished story from a feature

#### `/docs` Options
- `--update <path>` — update an existing doc to match current codebase state

### Examples with Flags

```bash
# Autonomous feature workflow
/feature --auto --deep Add user authentication
/plan --auto --deep FEAT-001
/next --auto
# In worktree:
/implement --auto --deep

# Epic-driven feature with lightweight research
/epic Add multilingual support           # in hub, no --deep for speed
/feature --epic=EPIC-001                  # in service, reads epic constraints

# Resume interrupted implementation
/implement --phase=3                      # pick up where you left off

# Quick documentation update
/docs --update docs/documentation/setup-guide.md
```

## Key Design Principles

**Deliberate pipeline.** Every command produces a specific artifact and stops. No command jumps ahead. `/feature` writes specs, never code. `/plan` writes plans, never code. Only `/implement` writes code.

**YAGNI enforcement.** The product owner agent and YAGNI checks in `/feature` challenge every "what if." Three lines of duplicated code beats a premature abstraction.

**Architect as gatekeeper.** The software architect agent runs a dependency check before any plan is written. If `stack.md` has TBD items the feature needs, planning halts until you decide.

**TBD is valid.** During `/init`, mark unknowns as TBD. Don't agonize over decisions you don't need yet. The architect will catch them at the right time.

**Documents as the source of truth.** Epics, features, plans, and decisions are markdown files in `docs/`. They're versioned in git, referenced by frontmatter IDs, and read by commands for context.

**Worktree isolation.** Each ticket gets its own worktree. Parallel work is possible. The backlog lock prevents conflicts. The main branch stays clean.

**Founder decides.** Agents recommend, the founder chooses. Every agent presents reasoning and options. No agent makes final calls.

## Customizing the Skills

The five skills (`git-practices`, `api-design`, `ui-design`, `data-layer`, `service-layer`) contain generic conventions. You have two options for customization:

1. **Edit in place** — Modify the skills with your project-specific conventions (e.g., change `api-design` to use your specific framework patterns). Good for single-project use.
2. **Keep generic + add project skills** — Leave these as templates and create project-specific versions (e.g., `go-api-design`, `react-ui-design`) with concrete code examples. Good if you share the library across multiple projects with different stacks.

The `/implement` command loads the relevant skill before writing code for each phase. It uses whatever skill names are present in `.claude/skills/`.
