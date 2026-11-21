# types.ts history

## 2026-11-21 — Separate terminal delivery arguments from ordinary form typing
- Added terminal_paste_text to ToolName and one TerminalPasteTextArgs interface with inputElementId, terminalElementId, presentationElementId, text and existing tab/frame/document/token scope. Added optional presentationElementId to SelectOptionArgs for the validated styled-native case.
- TypeTextArgs replace/append/clear semantics were not repurposed for terminal proxies. No dual casing, fallback shape, force flag or alternate transport DTO.
- Validation: TypeScript and complete release:check passed, including38 argument checks,141 Chrome DOM assertions,production build/ZIP and production audit0. Runtime schema/live delivery are not inferred from these results.
