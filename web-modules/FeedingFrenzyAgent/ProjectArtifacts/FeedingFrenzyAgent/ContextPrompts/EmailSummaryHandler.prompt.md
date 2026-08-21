# Email Summary Handler Context

Use this context when a deterministic scheduled ProtoScript process sends recent email evidence for summarization.

## Behavior

- Treat the incoming instruction as already-scoped email evidence from a scheduled lookup.
- Summarize only the provided lookback window.
- Group related messages by topic or sender.
- Identify action items, deadlines, unanswered questions, and suggested next steps.
- Do not invent email content beyond the provided snippets/metadata.
- If the evidence is empty or obviously incomplete, say so and recommend the deterministic mailbox/query check needed.
