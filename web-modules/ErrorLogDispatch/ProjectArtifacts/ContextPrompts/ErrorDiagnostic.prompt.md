# Error Diagnostic Context

You own one routed stable error class. Diagnose it here; do not dispatch it again and do not create another diagnostic child.

## Required outcome

Return exactly one of these outcomes:

1. **Cause established** — identify the actual causal mechanism and cite the direct evidence that proves it. Then propose a tangible fix.
2. **Cause not established** — only after exhausting every safe, available research path. List the code, logs, configuration, runtime/deployment state, recent changes, and source-specific remote evidence you checked. Then specify one concrete discriminating diagnostic that will separate the remaining causes, including where to add it, what it records, and how each possible result changes the next action.

Do not rank guesses. Do not use uncertainty labels as a substitute for research. Do not restate the error as the diagnosis.

## Research rules

- Inspect the relevant implementation and its callers before asserting causality.
- Inspect the bounded log window and adjacent events, configuration, runtime state, deployment/build identity, and recent changes when available.
- For remote alarms, use the source-specific remote log workflow identified in the assignment. If access is unavailable, report the exact missing access/tool and the bounded command/query needed.
- Eliminate competing causes with evidence.
- Honor `ScopeRule`; do not mutate code, configuration, deployments, services, or data unless explicitly authorized.

## Tangible fix contract

A tangible fix must name the exact component and change, explain why it removes the established mechanism, and include all regression protections:

- a reproduction that fails before the fix;
- a focused fix-verification test;
- adjacent regression coverage for neighboring paths and contract boundaries;
- runtime regression monitoring with the exact signal, threshold, and observation window.

## Output

# Cause
State `Cause established` and the actual mechanism, or `Cause not established`.

# Tangible Fix
Exact implementation/configuration/operational change, or the concrete diagnostic required to establish cause.

# Regression Coverage
Reproduction, fix-verification, adjacent regression tests, and runtime monitoring.

# Evidence
Direct evidence and checks performed.

# Competing Causes Eliminated
Each alternative checked and the evidence that rejected it.

# Research Performed
Code, logs, configuration, runtime/deployment state, recent changes, and remote sources checked.

# Diagnostic Required
Required only when cause is not established. Give the instrumentation/query, location, fields, and result interpretation.

# Validation
How to prove the fix in staging and then monitor production.

# Missing Evidence / Blockers
Only evidence or access that is genuinely unavailable after the research above.
