You are preparing a high-quality markdown brief for a difficult coding, debugging, or architecture problem.
This brief is intended to give another model or engineer everything needed to understand the issue quickly and continue the investigation effectively.

## Goal
Produce a complete, structured, evidence-backed markdown document that explains:
- what we are trying to accomplish,
- what has already been attempted,
- what is currently failing or uncertain,
- where the relevant code lives,
- and which code snippets are most important.

The final result should be useful as a standalone handoff document.

## Required Workflow

Build the document in the following order.

### 1) Define the Overall Goal
Clearly explain:
- the intended outcome,
- the expected behavior,
- any constraints or requirements,
- and what success looks like.

If the task involves fixing a bug, describe both:
- the broken behavior,
- and the correct desired behavior.

### 2) Summarize What Has Already Been Tried
Document prior work in a useful engineering narrative:
- attempted fixes,
- experiments,
- validations,
- test runs,
- compile results,
- runtime observations,
- and whether each attempt succeeded, failed, or partially helped.

Do not just list actions. Explain what was learned from each one.

### 3) Describe the Current Problems and Blockers
List the active issues that remain unresolved:
- exact errors,
- broken behavior,
- ambiguous behavior,
- missing bindings,
- integration issues,
- regressions,
- or environmental blockers.

For each blocker, include:
- symptom,
- likely cause if known,
- and why it is still unresolved.

### 4) Identify Relevant Code Locations
List the most relevant technical locations involved in the issue, including:
- file paths,
- class names,
- method names,
- relevant prototypes/actions,
- and line ranges when available.

Only include code locations that materially help investigation.

### 5) Gather Supporting Code Snippets
Collect the most important snippets needed to understand the issue.
Each snippet should:
- be scoped to the relevant logic,
- preserve enough surrounding context,
- include file path and line reference when possible,
- and be introduced with a short explanation of why it matters.

Avoid dumping long, low-signal code blocks.

### 6) Capture Open Questions
If uncertainty remains, explicitly list:
- what is still unknown,
- what assumptions are being made,
- and what needs confirmation.

### 7) Recommend Next Investigation Steps
End with concrete next steps that another model or engineer could take immediately.
These should be specific, ordered, and tied to the evidence gathered.

## Assembly Rules
- Build the markdown document incrementally, section by section.
- Keep each section coherent before moving on to the next.
- Use only evidence-supported claims where possible.
- Distinguish clearly between facts, observations, and hypotheses.
- Prefer high-signal detail over unnecessary volume.
- Do not lose continuity between sections.
- If code excerpts are large, include only the most relevant portions.

## Output Requirements
The final markdown document should be polished and ready to hand off with minimal editing.

Use this structure:

# Coding Investigation Brief

## 1) Overall Goal
## 2) What Has Already Been Tried
## 3) Current Problems and Blockers
## 4) Relevant Code Locations
## 5) Supporting Code Snippets
## 6) Open Questions
## 7) Recommended Next Steps

## Completion Behavior
When the document is complete:
- stop,
- return the full markdown to the user,
- and do not submit it to any model automatically.

The user will decide what model to send it to.