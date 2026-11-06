# ErrorDiagnostic Context

This context is installed from the package-owned `ProjectArtifacts/ContextPrompts/ErrorDiagnostic.prompt.md`. It requires an error-first summary that exposes the verbatim exception, verified throw site, affected context, time, impact, established findings, hypotheses, and next action before supporting analysis. It distinguishes throw, caller, and logger locations; forbids invented source locations and established-cause claims without decisive runtime evidence; caps the main response at 350 words; and still requires a discriminating diagnostic, tangible fix, and regression protection.

## Proposed delivery separation — design baseline v1, 2026-10-20

Proposed, not implemented: replace model-authored diagnostic assignments with routing fields and automatic original-turn evidence capture; use saved DiagnosticGuidance as the single investigation/report instruction body. Preserve diagnostic identity, ResetOnLimit, exact attachment/parent validation, collector state and canonical queue relay. Record prompt/evidence provenance and distinguish prepared versus admitted delivery. The diagnostic workflow requires local/remote source resolution, Creator raw-error/debug evidence, causal tracing and concrete code/user-message/configuration choices. Source-structure tests are not runtime acceptance. Validation at design authoring: nonmutating patch applicability only; no build, unit run, live delivery, Creator request or deployment. On implementation, append actual dated validation results before commit; do not reinterpret this entry as executed verification.

## 2026-10-20 — Implement code-owned Markdown diagnostic delivery

Implemented the approved separation: routing-only request/action, original current-turn evidence capture, single saved DiagnosticGuidance, exact diagnostic destination checks, Markdown assigned scope/provenance/instructions/evidence, bounded rejection without evidence truncation, prompt/assignment hashes and real queue receipts. Diagnostic instructions require machine-bound Creator raw/error/debug evidence, causal tracing, actionable code/user-message/configuration choices and a full report. Context no longer duplicates the report workflow. Tests now validate the authoritative guidance and execute deterministic Markdown composition including embedded fences and limit rejection. Validation: Release module build succeeded; package tests passed 15/15. Staging end-to-end diagnosis and screenshots remain pending at this source checkpoint; no runtime acceptance claimed here.

## 2026-11-05 — Fixed HTML diagnostic reporting

Matt selected the previously displayed HTML report as the required diagnostic format. Added a single package-owned fixed template, plain-text findings contract and deterministic renderer; wired protected local and alarm contexts, direct working-owner assignments, ErrorDiagnostic context and saved DiagnosticGuidance to it. Preserves research depth, tree routing, cooldown/deduplication, session policy and informational database-monitor exception. Reports use metadata.format=html; exact HTML supersedes old visible Markdown headings/chips only. The installed shell uses sandboxed srcdoc, so raw suggestions fences are deliberately not appended. No shared web UI changes, restart, incident replay, real dispatch or application repair.

Validation: standalone package tests 23/23 pass, executable local/remote synthetic fixtures pass including escaping/unknown throw/missing-field rejection; installed and source timeline DOM fixtures preserve the generated HTML in the actual sandboxed renderer. Owning settings API accepted full shared configuration with unchanged policy/process IDs and new reporting guidance. No future model compliance or already-running assignment acceptance is claimed.

## 2026-11-06 — Evidence-backed completion and understandable results

Require shared research and completion before rendering; retrieve needed underlying logs through authorized APIs. Replace old visible section requirements with the cold-reader report and preserve native actions.

Validation: package tests passed 23/23; executable renderer acceptance passed including negative records. Installed/source report hashes and installed rendering match. Real Chrome with installed shared UI passed 4/4 known/unknown and integrated/standalone cases; every displayed chip populated the exact composer instruction and report HTML stayed unchanged. These are synthetic cases, not fresh end-to-end diagnoses. No incident replay, queue mutation, process restart or application repair.
