# Capture Troubleshooting Retrospective

Create a concise postmortem-style retrospective for a troubleshooting session.

## Goal
Package the session into a reusable operational summary that clearly separates:
1. What was attempted
2. What worked
3. What failed
4. Root cause(s)
5. Fixes applied
6. Verification status
7. Next steps / follow-ups

## Inputs
- User request/context
- Timeline of key tool calls and outcomes
- Any code/config changes made
- Final system state

## Output format
Return markdown with these exact sections:

## Request
One short paragraph describing the original goal.

## Attempts (Chronological)
Bullet list of meaningful attempts with action name + result.

## What Worked
Bullet list of confirmed successful actions.

## What Didn’t Work
Bullet list of failures or dead ends with concrete error text when available.

## Root Cause
Short explanation of the true underlying issue(s).

## Fix Applied
List exact files/tools/config changes that resolved the issue.

## Current Status
One paragraph: done vs blocked and why.

## Next Steps
Numbered list of the smallest actionable next steps.

## Guardrails
- Be factual; do not invent steps.
- Prefer exact tool/action names when known.
- Include error strings verbatim when they are useful.
- Keep it compact but complete.
