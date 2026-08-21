# Memory.pts Change Notes

## 2026-04-12
- Removed `ToRememberOntologyObjectSkill` and `ToRememberHowToDoSomethingSkill` from `Memory.pts`.
- Design: the remembering workflows now live in `CoreActions.pts` so they are part of the core action surface instead of a secondary memory-only registry.
