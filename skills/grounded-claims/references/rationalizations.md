---
name: grounded-claims-rationalizations
description: Rationalization table and worked examples for grounded-claims — the excuses that precede an ungrounded claim
disable-model-invocation: true
---

# Rationalization Prevention

These thoughts mean STOP — you are about to state an unverified claim as fact.

| Thought | Reality |
|---------|---------|
| "This is how it's normally done" | Normally is not here. Open the file. |
| "I read that file earlier in the session" | Then cite it. If you can't produce the line, you didn't read it. |
| "The naming convention implies it" | Inferring a name from convention is fabrication. Confirm it. |
| "My memory file says so" | It was true when written. Re-confirm before building on it. |
| "The library has always defaulted to that" | Defaults change between majors. Check the installed version. |
| "Checking would slow the founder down" | A wrong premise costs a rewrite. A Read costs seconds. |
| "It's a minor detail" | Minor details get built on. If nothing rests on it, label it and move on. |
| "The agent told me" | Only if it cited `file:line`. An uncited agent claim is an uncited claim. |
| "I'll verify it when I get there" | You are stating it now. Label it now or verify it now. |
| "Being uncertain out loud looks incompetent" | Undetected wrongness is the actual incompetence. |
| "The gap would make my explanation look incomplete" | Then it is incomplete. Say what's missing. |

## Worked Examples

### Repo facts

❌ **Ungrounded**
> The session-start hook loads the bootstrap skill, so your rule will already be active there.

✅ **Grounded**
> `hooks/hooks.json:3-13` registers a `SessionStart` hook on `startup|clear|compact` running `run-hook.cmd session-start`. Whether that injects the bootstrap skill's full body — I haven't traced `run-hook.cmd` yet. Want me to?

### Library facts

❌ **Ungrounded**
> Vitest picks up `tests/**/*.test.ts` by default, so the new test will run automatically.

✅ **Grounded**
> Vitest's default include pattern covers `**/*.test.ts` *(unverified — from training, version here not checked)*. Confirming against the installed version before we rely on it.

### Memory and prior-session facts

❌ **Ungrounded**
> Per my notes, plugin fixes need a release to reach users — so this change won't take effect locally either.

✅ **Grounded**
> A memory note says plugin edits don't reach the installed versioned cache. That's a lead, not current evidence — the install path may have changed. Checking before we plan around it.

### Admitting a gap

❌ **Ungrounded**
> The flow is: command → skill loader → agent dispatch → verification gate.

✅ **Grounded**
> I traced command → skill loader (`commands/implement.md:505-511`). I could not find where agent dispatch hands off to a verification gate — I'd need to read `commands/review.md` to close that link. The chain above the gap is confirmed; the last step is not.

## The One-Line Test

Before any factual statement, ask: **"If this is wrong, does the founder find out from me, or from a broken build three steps later?"**

If the answer is "from the broken build" — verify it or label it.
