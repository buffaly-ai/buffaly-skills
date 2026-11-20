# method-runner.html history

## 2026-11-20 — Consume composer launch context and restore renderer readiness

The runner initializes Bound session from explicit `sessionKey` before remembered/default values and initializes Concept or instruction from the exact `message` query value. Nullish selection preserves explicit empty values for the existing required-input validation rather than silently repairing them. Opening the page does not persist session choices, create sessions, or invoke the selected method. Existing explicit Run method payload, guards and renderer remain unchanged.

Live validation exposed a separate existing blocker: timeline-card-builtins now requires BuffalySafeMarkdown, which the old runner did not load. Added the existing shared marked parser and buffaly-safe-markdown scripts before builtins, preserving the shared sanitization pipeline rather than introducing local rendering or bypassing validation. This restores script initialization and the real Run handler.

Validation: standalone page on HTTPS port5320 displayed build2026.11.20.2, exact multiline Unicode launch text/session and ToProposeOntologyNeighborhoodSkill; real Run onclick and shared renderer are initialized; zero run-method requests on opening, no failed resources on reload. 18 Node tests and 56 .NET tests pass; Release solution build succeeds with transitive warnings. No inference was requested by this navigation test. Existing page-local styling is inherited UI-STD-01 Principle5 debt, not changed by this routing repair.
