# index.pts Change History

## Initial Creation (2026-04-15)
- Created the dedicated `Level2Watcher` skill and moved `ToDispatchSupervisoryEvent` into it.
- Design Decision: supervisory callback digestion belongs with Level2 watcher behavior, not generic session-management actions.

## Move Remaining Watcher-Only Actions Into Level2Watcher Skill (2026-04-15)
- Moved observed-session lookup, watcher-to-observed send helpers, and Level1 supervisory artifact readers into the dedicated `Level2Watcher` skill.
- Design Decision: actions that only make sense inside the Level2 watcher relationship should live on the watcher skill surface instead of the generic session-management surface.

## Route Watcher Message Sends Through SessionTools Directly (2026-04-15)
- Updated watcher-to-observed send actions to call `SessionTools.SendToSessionTool(...)` and `SessionTools.SendToSessionAndWaitTool(...)` directly instead of routing through `CoreOntologyTools.SendToSession...`.
- Removed the obsolete timeout parameter from the watcher wait action and awaited the native async session tool directly.
- Design Decision: watcher messaging should use the canonical session tool surface instead of the older runtime-host cross-session path.

## Read ObservedSessionKey Directly From Watcher UserState (2026-04-15)
- Updated watcher actions to read `ObservedSessionKey` directly from the existing `UserState` extern instead of calling deleted session-user-state helper methods in C#.
- Design Decision: watcher-local user-state access should stay local instead of depending on redundant C# wrappers.

## Strip Watcher Send Wrappers Down To Direct SessionTools Calls (2026-04-16)
- Simplified the observed-session send wrappers to delegate directly through `ToGetObservedSessionKey.Execute()` into `SessionTools.SendToSessionTool(...)` and `SessionTools.SendToSessionAndWaitTool(...)`.
- Design Decision: the watcher send helpers should stay as thin string-returning wrappers and let the underlying session tools enforce instruction/session validation.

## Add Explicit End-Cycle Delivery Signal For Watcher Guidance Sends (2026-04-16)
- Updated `ToSendMessageToObservedSessionAndReturn` to dispatch through `SessionTools.SendToSessionTool(...)` and then return a plain-text delivery signal instead of serialized queue JSON.
- Design Decision: the Level2 watcher needs a strong stop cue after one guidance dispatch so one callback cycle does not keep looping and sending repeated nudges to Level1.

## Auto-Prepend Level 2 Timeline Label For Watcher Guidance (2026-04-16)
- Updated `ToSendMessageToObservedSessionAndReturn` to prepend `[label: Level 2]` when the outgoing instruction does not already start with a supported label marker.
- Design Decision: watcher guidance should consistently render as a labeled Level2 card in the observed session timeline without relying on the model to remember the label prefix every time.

## Remove Synchronous Observed-Session Wait Action (2026-06-13)
- Removed `ToSendMessageToObservedSessionAndWait` from the Level2 watcher skill surface.
- Design Decision: normal Level2 guidance must be queued through `ToSendMessageToObservedSessionAndReturn` so it cannot synchronously steer or interrupt an active Level1 turn.
