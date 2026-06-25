# Search Previous Sessions (SemDB + Disk)

Goal
- Find where a topic was discussed in prior sessions.
- Use SemDB retrieval to get candidate conversations and relevant fragments.
- Then read raw `session.json` files from disk to answer from authoritative source text.

## Steps
1. Call `ToFindTopConversationsForQuery` with the user query.
   - Use sensible defaults if not provided:
     - `topConversations=5`
     - `topFragmentsPerConversation=3`
2. From results, collect candidate `SessionFilePath` values and snippet anchors.
3. For each top candidate session file path:
   - Read the raw session file from disk.
   - Base path root: `C:\dev\Buffaly.Sessions\OpsAgent`
   - Prefer session paths returned by tool output first.
4. Use fragment snippets/anchors as hints to locate likely turns in the raw session.
5. Summarize findings with citations:
   - Session key
   - Session file path
   - Turn/fragment context if available
6. If SemDB retrieval is sparse, expand candidates and search disk text directly in those sessions.

## Output format
- `Top candidate sessions`
- `What was discussed`
- `Evidence` (session path + turn/fragment snippet)
- `Confidence / gaps`

## Rules
- SemDB is for candidate discovery; raw disk session data is authoritative.
- Do not fabricate citations.
- If no evidence exists, state that clearly.
