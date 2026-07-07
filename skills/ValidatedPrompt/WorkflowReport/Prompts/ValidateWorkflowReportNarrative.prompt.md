# Validate Workflow Report Narrative

Validate that the candidate narrative accurately reflects the supplied `buffaly.workflowRunReport.v1` JSON report.

Pass only if:

- the overall status matches the JSON
- failed, blocked, and unvalidated nodes are not omitted
- validation counts are correct when stated
- the hierarchy is not materially misrepresented
- artifact references are not invented
- no unsupported claims are added
- the narrative clearly treats the JSON as the source of truth
