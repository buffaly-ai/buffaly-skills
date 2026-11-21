# tool-contract.ts history

## 2026-11-21 — Explicit selection presentation and terminal insertion contract
- Added optional select_option.presentationElementId and a distinct terminal_paste_text with required opaque inputElementId, terminalElementId, presentationElementId and text, plus existing document/frame/tab/token scope. No force flag, selector alias, useDebugger option, submission or ordinary type_text widening.
- Terminal arguments reject empty/control/newline/Unicode-line-separator text before routing. Unknown/missing/type validation remains authoritative for both executable dispatch and get_status schema; production function independently validates insertion boundaries.
- Validation:38 executable argument checks and full release:check passed, including TypeScript,141 real Chrome DOM checks,build,ZIP and production audit0. Actual installed public schema and live consumers remain separate acceptance criteria.
