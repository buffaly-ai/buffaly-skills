# launch.html history

## 2026-11-20 — Explicit Method Runner launch

Added `page=runner` selection for both standalone `/harness/method-runner` and installed `/web-modules/OntologyWorkbench/method-runner`, preserving all incoming query values and the originating settings URL. Ordinary Tool Menu launches remain Grammar; `prototypeName` retains viewer precedence. No session creation, method execution, or storage write occurs in this router. This preserves the intentional standalone/web-module launch preference introduced by the earlier launcher commits instead of bypassing it for the composer.

Validation: actual inline router executed by Node tests for both modes, default standalone, ordinary Grammar, symbol viewer precedence, special-character context. Live standalone navigation reached Method Runner with exact session/message. 18 Node and 56 .NET tests pass; Release build succeeded with transitive warnings. Installed activation is separate release evidence.
