# code-reviews-commit-files.js history

## 2026-11-18 — Automatic commit-file list design baseline
- Proposed scope: code-reviews-commit-files.js participates in the bounded, read-only first-parent metadata flow and inline current-source links described by automatic-commit-file-list-v1.md.
- Why: expose changed files without entering Code Review or fetching patches/content during timeline rendering; preserve existing reviewer and file-viewer contracts.
- Design validation: patch applicability and JavaScript syntax are checked in the retained design receipt. Application builds, tests and installed UI/performance checks are not claimed at design time. The implementation batch must append its actual validation results before committing.

## 2026-11-18 — Implement approved v1
- Implemented visible names-only enrichment, shared bounded promise/result memo, eight-file server paging, explicit retry and current-source provider links. Commit/review controls remain intact; no polling, patch/blob requests, new styles or collapsed content.
- Validation: Release WebHarness build succeeded (two existing assembly-conflict warnings); recorded full C# run 193 passed / 5 failed out of 198. All five failures were reproduced against unchanged baseline 209f1b6 and require a configured sessions database in existing artifact-reader fixtures. All four new metadata tests passed. JavaScript regression suites: 43/43 passed, including six new enhancer cases; syntax and diff checks passed. Installed staging acceptance is recorded separately after activation.

