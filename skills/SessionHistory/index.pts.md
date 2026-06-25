# index.pts Change History

## Extract Session History Skill From SessionManagement (2026-04-15)
- Moved session-history paging and summarization actions into the dedicated `SessionHistory` skill.
- Design Decision: session timeline reading and summarization now live outside generic session-management wrappers so the skill surfaces stay narrower and easier to compile.

## Remove Raw History Paging From Agent-Facing Surface (2026-06-01)
- Removed `ToGetSessionHistoryPage` from the ProtoScript skill surface so agents do not default to raw page text that can include large tool result rows.
- Updated remaining summarization descriptions to warn that they are slow recap tools and should not be used for routine session inspection, child-session progress, or latest-result retrieval.
- Design Decision: normal session inspection now starts from bounded SessionManagement turn-summary tools, while C# history paging can remain available for internal diagnostics if needed.
