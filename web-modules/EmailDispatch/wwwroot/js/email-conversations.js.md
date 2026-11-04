# email-conversations.js history

## 2026-11-04 — independent conversation exploration
Added page glue for generated GetConversations/GetConversation/GetConversationBody, shared CursorGrid/PagedGrid/status/date/Inputs/sandbox owner. Server controls exact thread membership, reply chronology and search. No frontend mailbox grouping/filtering or send/draft mutations. Direct message reload receives authoritative metadata with body. Route version rejects late body results; navigation cancels grid versions; errors use shared run/grid feedback. Browser1440/390 search/cursor/thread/sent/draft/body/reload/Review4/4 combined with pure+denial tests passes. Final live provider/regression/installed results appended after execution.

## 2026-11-04 — restore access to dispatch from message reading
Added Review dispatch navigation in shared message-tools; it links to existing /#email/<ObservationKey> rather than duplicating commands/dialogs. Hidden and href removed on every open until authoritative response provides saved identity; route version rejects stale response. No send on navigation. Desktop1440/phone390 tests pass exact route, existing picker and absent link for sent/draft/uncaptured messages; focused5/5/routine51/51. Cache version in owning HTML incremented.
