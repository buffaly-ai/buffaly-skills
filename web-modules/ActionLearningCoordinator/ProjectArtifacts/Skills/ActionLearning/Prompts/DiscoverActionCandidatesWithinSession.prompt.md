# Discover Action Candidates Within One Historical Session

Review the Level 1 session observed and identify where a genuinely missing reusable action would have simplified or accelerated the work. Use the historical route actually seen; do not give generic advice and do not design or implement code.

A Level 2 digest is one useful source of the observed Level 1 route. Level 2 is not required: when no relevant digest exists, inspect the Level 1 session history directly.

Return up to 5 missing-action candidates, ranked strongest to weakest within this session. It is valid to return `NONE` if no genuinely missing action is supported by the evidence.

For each candidate provide:

1. Rank and concise proposed action purpose/name.
2. Exact historical segment it would have replaced or shortened.
3. Why existing actions were insufficient. Distinguish a missing action from incorrect routing, a prompt/description problem, an implementation bug, or a one-off task.
4. Conceptual inputs and minimum outputs/evidence needed downstream.
5. Expected reduction in calls, tokens, latency, retries, nondeterminism, or risk.
6. Safety and validation behavior that must be preserved.
7. Existing capability or authoritative owner to check first.
8. Justification for rank and confidence.

Include rejected alternatives. Do not compare with other sessions, require recurrence, synthesize across histories, or design an implementation.

This is candidate discovery only. Existing-capability inspection, counterfactual replay, cross-session consolidation, metric scoring, prioritization, and implementation decisions happen later.