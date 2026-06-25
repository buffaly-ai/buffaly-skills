# ToResolveTopCandidateAndRun

Use this action to execute a semantic goal with deterministic action selection.

## Inputs
- `semanticGoal`
- Optional `maxResults` (default 5-8)

## Steps
1. Resolve the best matching loaded skill/action for `semanticGoal`.
2. Select the safest candidate by relevance and execution risk.
3. Execute the selected action.
4. Summarize result, including chosen action and output status.

## Output
- Action executed through a clear resolve/execute path.
- Short operational summary.
