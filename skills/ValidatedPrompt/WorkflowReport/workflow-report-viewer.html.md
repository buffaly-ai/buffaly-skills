# workflow-report-viewer.html

## Purpose

Reusable static HTML viewer for `buffaly.workflowRunReport.v1` JSON files.

## 2026-07-05

- Added a JSON-driven recursive workflow report viewer under the ValidatedPrompt skill as the temporary workflow-reporting host.
- Supports `?json=...`, `#json=...`, and local JSON file picker loading.
- Renders workflow, validated prompt action, validation gate, workflow validation, and deterministic step nodes from the supplied JSON without changing run status or calling the agent.
