---
name: handoff
description: Write the session handoff to ops/status.md then push it to the hub. Invoke at session stop, or whenever the Stop hook blocks with "write the handoff".
---

# /handoff — write the handoff while context is hot

You are stopping work on this repo. Before you stop, capture the orientation your
tomorrow-self needs, per SPEC.md §4.1. Do this from LIVE context — do not re-derive.

1. Open `ops/status.md`. Update the frontmatter to reflect reality RIGHT NOW:
   - `constraint.statement` (≤140 chars, imperative, no hedging) + `type` + `since`
   - `next.action` (a physical action startable in <2 min of setup) + `est_minutes`
   - `next.exploits_constraint` (does it exploit THIS project's constraint?)
   - `next.exploits_portfolio` (does it exploit the portfolio constraint from `ops prime`?)
   - `prt.chain` (≤6 linear nodes) + `prt.frontier` (deepest incomplete node)
   - `health` (green|yellow|red — your honest one-word judgment)
   - `flags` (DELETE_CANDIDATE, NEEDS_HUMAN_DECISION, CLOUD_DUE as they apply)
   - Do NOT touch `updated`, `machine`, `session_commits`, `portfolio_ref` — the tool owns those.
2. Rewrite the `## Handoff` prose (≤120 words): where you stopped, what you
   learned, traps discovered, anything half-finished and dangerous.
3. If you made a decision worth keeping across sessions, run:
   `ops push --decision "one line, what and why"`  (this also pushes status.md)
   Otherwise just run `ops push`.
4. Confirm the push printed `pushed projects/<name>/status.md`. You may now stop.
