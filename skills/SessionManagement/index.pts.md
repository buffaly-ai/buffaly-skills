# index.pts Change History

## Rename Session Message Lookup Inputs To MessageKey (2026-04-12)
- Updated `ToGetSessionAssistantMessageMarkdown` and `ToExportSessionAssistantMessageMarkdownToDisk` to use `messageKey` terminology in descriptions, infinitive phrases, and parameter names.
- Design Decision: session-message lookup skills now match the canonical Buffaly message identity contract instead of teaching obsolete `messageId` naming.

## Route Child Session Creation Through SessionTools Service Facade (2026-04-15)
- Updated `ToCreateBuffalyChildSession` to call `SessionTools.CreateBuffalyChildSessionTool(...)` directly without requiring `_opsAgent`.
- Design Decision: child-session creation now routes through the authoritative C# service path instead of keeping a ProtoScript-only runtime-host dependency for this flow.

## Move Supervisory Callback Action To Dedicated Level2Watcher Skill (2026-04-15)
- Removed `ToDispatchSupervisoryEvent` from the session-management skill.
- Design Decision: supervisory callback digestion is watcher-specific behavior and should not live under generic session-management actions.

## Remove Remaining Watcher-Only Actions From SessionManagement (2026-04-15)
- Removed observed-session helpers and Level1 supervisory artifact actions from the session-management skill.
- Design Decision: watcher-only actions now live under the dedicated `Level2Watcher` skill, leaving session-management focused on generic session operations.

## Collapse User-State Reads To One Session-Key-Based Action (2026-04-15)
- Replaced the old per-key and current-session user-state actions with a single `ToGetUserState(sessionKey)` action.
- Design Decision: the session-management surface now exposes one full user-state read path keyed only by session key instead of redundant wrapper actions around key-by-key lookup.

## Align Create Session Action To Worker-Aware Agent Status Contract (2026-04-15)
- Changed `ToCreateBuffalySession` to return `AgentStatusContract` instead of `BuffalyAgent`.
- Design Decision: create-session now follows the worker-aware host service contract exposed by `SessionTools.CreateBuffalySessionTool(...)` instead of returning an in-process runtime object that cannot represent remote worker ownership.

## Mirror Full SessionTools Surface In SessionManagement Wrappers (2026-04-15)
- Added the missing host-contract imports required by the SessionManagement wrappers for queued inputs, evaluate responses, and active-session info rows.
- Design Decision: the SessionManagement ProtoScript surface now fully mirrors the current public `SessionTools.cs` API with thin pass-through wrappers and no ProtoScript-side normalization or validation.

## Correct Host Type Import Alias In SessionManagement (2026-04-15)
- Changed SessionManagement host-type imports from the stale `Buffaly.Agent.Tools` alias to `Buffaly.Agent.Host`.
- Design Decision: host contracts now resolve through the authoritative host assembly alias instead of an obsolete tools alias.

## Delegate Session Event Handler Wrappers Through BuffalyAgentService (2026-04-15)
- Changed session event-handler wrappers to call `BuffalyAgentService` directly and removed ProtoScript-side event-type default injection.
- Design Decision: SessionManagement now defers event-handler contract behavior to the authoritative host service instead of adding local wrapper defaults.

## Remove ProtoScript Session Event Handler Wrappers (2026-04-15)
- Removed the old session event-handler registration and enable/disable wrappers from SessionManagement.
- Design Decision: OpsAgent no longer keeps ProtoScript-side session event wrapper patterns in this skill surface.

## Add Child Session Reuse Guidance And Lookup Tool (2026-04-16)
- Updated `ToCreateBuffalySession` and `ToCreateBuffalyChildSession` descriptions to explicitly prefer reusing an existing session instead of creating duplicate sibling sessions.
- Added `ToGetChildSessions` as a thin wrapper over `SessionTools.GetChildSessionsTool(...)` so agents can inspect existing child sessions before creating another one.
- Design Decision: session creation guidance should steer agents toward reuse-first behavior, while child-session discovery should use the exact same canonical session-status contract already used by create and status actions.

## Remove MaxCount From Child Session Wrapper (2026-04-16)
- Removed the `maxCount` parameter from `ToGetChildSessions` and its description.
- Design Decision: the ProtoScript wrapper should match the simplified child-session tool contract and not expose a fake count knob.

## Remove Provider-Sensitive ProtoScript Markdown/File Export And Activity Scan Wrappers (2026-04-16)
- Removed ToWriteMarkdownStringRefToDisk, ToExportSessionAssistantMessageMarkdownToDisk, and ToGetSessionKeysActiveSinceUtc from OpsAgent SessionManagement.
- Design Decision: these wrappers either had no meaningful in-project callers or embedded file-store assumptions / local disk behavior that do not hold for SQL-backed session providers. Provider-sensitive session operations should live in canonical C# tools instead of ProtoScript wrappers.

## Align SessionManagement Wrapper Return Types To SessionTools Contracts (2026-04-16)
- Changed the create, queue-send, send-and-wait, status, and active-session wrappers to return `SessionStatusResult`, `QueuedInputResult`, and `List<SessionStatusResult>` to match `SessionTools`.
- Design Decision: SessionManagement must declare the same authoritative ProtoScript return types as the C# tool surface or the watcher callback tool load will skip the file during prototype compilation.

## Add Bounded Session Turn Inspection Wrappers (2026-06-01)
- Added `ToGetMostRecentSessionTurn`, `ToGetRecentSessionTurns`, `ToGetSessionTurnPage`, and `ToGetSessionTurnDetail` as thin wrappers over the new `SessionTools` turn-summary/detail methods.
- Updated the turn actions to call the `SessionTools` facade instead of directly importing/calling `BuffalyAgentTurnService`, keeping ProtoScript as thin glue and preserving C# as the authoritative validation/bounding layer.
- Added progress/result-focused semantic phrases so child-session inspection should prefer the most-recent/recent turn summaries over raw history paging or slow summarization.
- Design Decision: the primary starting point for inspecting a session belongs in SessionManagement because it is used alongside child-session creation, send, wait, and status operations.

## Add Safe Parent Session Setter Wrapper (2026-06-01)
- Imported `SessionParentResult` and added `ToSetBuffalySessionParent(sessionKey, parentSessionKey)` as a thin wrapper over `SessionTools.SetSessionParentTool(...)`.
- Described both parameters as exact existing session keys, not display names, and documented that the tool never creates sessions, rejects self-parenting and parent cycles, and returns both `SessionName` and `ParentSessionName` for clear verification.
- Design Decision: re-parenting an existing session should be a dedicated no-create action instead of overloading the child-session creation tool.

## Expose Optional Turn Detail maxRows (2026-06-04)
- Updated `ToGetSessionTurnDetail` to accept optional `maxRows`, defaulting to 200, and forward it to the C# session tool facade.

## Add Stored-Procedure Backed Message Search Wrappers (2026-06-04)
- Added `ToSearchSessionMessages(search, maxRows)` as a thin wrapper over `SessionTools.SearchSessionMessagesTool(...)`.
- Added `ToSearchSessionFinalAssistantMessages(search, maxRows)` as a thin wrapper over `SessionTools.SearchSessionFinalAssistantMessagesTool(...)`.
- Documented that both wrappers return compact JSON with `MessageID`, `SessionID`, `MessageKey`, `TurnKey`, `SequenceNumber`, `Role`, and `Text`.
- Design Decision: direct session-message search belongs in the existing SessionManagement skill and should expose fixed domain tools rather than generic SQL parameters or the heavier semantic conversation search path.

## Add Targeted Archive/Unarchive Wrappers (2026-06-11)
- Imported `DeleteSessionResultContract` and added `ToArchiveBuffalySession(sessionKey)` as a thin wrapper over `SessionTools.ArchiveSessionTool(...)`.
- Added `ToUnarchiveBuffalySession(sessionKey)` as a thin wrapper over `SessionTools.UnarchiveSessionTool(...)`.
- Design Decision: archive/unarchive should be explicit SessionManagement tools backed by targeted session metadata APIs, not prompt workflows that move folders.

## Remove Send-And-Wait Registration (2026-06-14)
- Removed the `ToSendToSessionAndWait` ProtoScript prototype so SessionManagement only exposes the supported one-way `ToSendToSession` cross-session send.
- Design decision: cross-session wait semantics are unsupported, and the skill surface should not advertise a tool that now fails fast by design.

## Add Parent-Key And Sibling Session Actions (2026-06-16)
- Added `ToGetBuffalySessionParentKey` with phrases for retrieving a session parent key.
- Added `ToCreateBuffalySiblingSession` with phrases for creating a sibling under the same parent as a source session.
- Design Decision: expose sibling creation as one typed SessionManagement action instead of forcing callers to manually combine runtime-context, create-session, and set-parent tools.

## Keep Offline Ontology Critic Out Of Core SessionManagement (2026-06-20)
- Removed offline ontology critic launcher/import notes from the normal SessionManagement surface.
- Design Decision: offline ontology critic orchestration is owned by the separate `lib/web-modules/OfflineOntologyCritic` package and should not be part of the normal Buffaly agent/session-management surface.

- 2026-07-11 - Clarified ToCreateBuffalyChildSession guidance: child creation does not set models; create/attach first, inspect the provider catalog, then set the child session model with an exact catalog ModelName.
