# Wiki prompt actions

This file registers prompt-based wiki workflows for:
- creating one wiki article,
- refreshing a weak article,
- auditing wiki coverage,
- repairing wiki cross-links.

## Design intent
The Wiki skill should remain light in ProtoScript and should not accumulate complex business logic there. If future wiki functionality needs structured parsing, indexing, or link-analysis logic, that work should move into an appropriate C# library and be surfaced through typed actions.

## Change notes
- Added `WikiPromptAction` as a wiki-owned prompt base so wiki prompt workflows no longer inherit directly from the generic `PromptAction` base.
- Kept all public wiki prompt action prototype names unchanged while aligning ownership with the local Wiki skill pattern.