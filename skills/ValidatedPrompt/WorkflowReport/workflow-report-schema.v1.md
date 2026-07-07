# Buffaly Workflow Run Report Schema v1

Schema id: `buffaly.workflowRunReport.v1`

Workflow run reports are deterministic accounting artifacts emitted by a workflow runner. A viewer or prompt may render or explain this JSON, but must not decide status or infer missing workflow nodes.

## Top-level shape

```json
{
  "schema": "buffaly.workflowRunReport.v1",
  "generatedUtc": "2026-07-05T15:30:29Z",
  "source": {},
  "summary": {},
  "root": {}
}
```

## Node shape

```json
{
  "id": "stable-node-id",
  "type": "workflow|validatedPromptAction|validationGate|workflowValidation|deterministicStep",
  "name": "Human-readable name",
  "status": "running|passed|pass|failed|fail|blocked|completed",
  "output": "Optional human-readable output or summary",
  "artifacts": [],
  "result": {},
  "children": []
}
```

## Rules

- The runner owns truth.
- The viewer renders truth.
- Prompt skills explain truth.
- Do not reconstruct missing child workflows after the fact and present them as executed.
- Do not omit failed, blocked, or unvalidated nodes from narrative summaries.
