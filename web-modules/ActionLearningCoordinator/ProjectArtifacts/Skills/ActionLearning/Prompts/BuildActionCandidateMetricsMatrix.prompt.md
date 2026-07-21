# Build an Action Candidate Metrics Matrix

Given candidate-action discovery results from multiple historical sessions, produce a reviewable cross-session Markdown metrics matrix and general-value ranking. This is a separate stage after per-session discovery.

## 1. Establish the input inventory

List every source session and its discovered candidates. Preserve the originating session for each candidate. Record `NONE` results as useful calibration evidence, but do not turn them into candidates.

Report:

- total source sessions reviewed;
- raw candidate count;
- excluded experiment-caused findings;
- merged duplicate count;
- final distinct candidate count.

## 2. Remove experimental contamination

Filter out candidates caused by the current Action Learning/Action Foundry experiment itself unless the requested scope explicitly includes meta-tooling. Examples include the candidate reviewer, experiment artifact plumbing, Level 2 inventory, and Level 2 request/response machinery.

Explain every exclusion. Do not exclude a candidate merely because it is narrow or appears only once.

## 3. Consolidate materially equivalent candidates

Merge candidates only when they express the same reusable goal, boundary, required evidence, and likely owner. Preserve all source-session references on the merged entry. Keep related components separate initially, then state when one should become an internal primitive of another rather than a competing top-level action.

## 4. Score each distinct candidate

Score every candidate independently on these 1-10 dimensions:

- Breadth of future applicability
- Likely frequency
- Calls/tokens/retries/latency eliminated
- Safety and error-prevention value
- Deterministic evidence produced
- Stability of the reusable boundary
- Existing-capability overlap
- Implementation risk
- Narrow product or machine coupling

Higher is better for the first six dimensions. Higher overlap, implementation risk, and narrow coupling are penalties. Explain each score briefly and do not hide the dimensions inside an unexplained composite.

Also provide:

- Reusability score, 1-10
- Savings score, 1-10
- Estimated savings per applicable use in calls and elapsed time, plus retries/tokens/risk where supportable
- Provisional implementation form: PromptAction, C#-backed ProtoScript action, or hybrid
- A conceptual ProtoScript surface with provisional prototype name, description, infinitive phrase, inputs, and minimum result/evidence contract
- Likely authoritative owner
- Confidence

Fence conceptual action surfaces as `protoscript`. They describe the action clearly enough to review and compare, but they are not final engineering contracts.

If a combined score is useful, show the formula explicitly. Never let a combined score override weak evidence, unsafe boundaries, high existing-capability overlap, or implementation risk.

## 5. Produce the general-value ranking

Rank the distinct candidates by expected general value. For each ranked candidate include:

1. Rank and concise purpose/name.
2. One-paragraph reusable boundary and historical work it would replace.
3. Source-session references.
4. The full metric row and score rationale.
5. Estimated per-use savings.
6. Existing owner/capability to inspect first.
7. Provisional implementation form.
8. Conceptual ProtoScript surface.
9. Key safety, evidence, overlap, and implementation-risk notes.

Do not treat recurrence as an eligibility requirement. Multiple candidates may originate from one session, and a strong one-off historical example may still justify validation.

## 6. Recommend consolidation

Identify:

- candidates that should be combined into a suite;
- candidates that should extend an existing workflow;
- candidates that should be internal primitives of another action;
- candidates better tested first as LLM prompts;
- candidates that should not be pursued because their infrastructure is disabled or obsolete.

## 7. Select a validation tranche

Recommend the first small group for:

1. existing-capability inspection; and
2. counterfactual replay against the original historical segment.

This is not implementation approval. State that explicitly.

## Required Markdown artifact

Return:

1. scope and input inventory;
2. contamination exclusions;
3. duplicate/consolidation ledger;
4. full candidate metrics table;
5. general-value ranking;
6. recommended consolidation;
7. first validation tranche;
8. limitations and unresolved questions.

Do not design final engineering contracts, implement tools, or claim that ranking constitutes approval.
