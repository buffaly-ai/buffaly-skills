# Generate Workflow Report Narrative

You are given a `buffaly.workflowRunReport.v1` JSON document.

Create a concise human-readable workflow report that explains:

- overall workflow status
- workflow hierarchy
- which validations passed, failed, or are missing
- blocked or failed nodes, if any
- important artifacts produced
- recommended next operator action

Rules:

- Do not invent status.
- Do not change pass/fail decisions.
- Do not omit failed, blocked, or unvalidated nodes.
- Do not reconstruct missing workflow nodes and present them as executed.
- If a field is missing, say it is missing.
- Treat the JSON as the source of truth.
