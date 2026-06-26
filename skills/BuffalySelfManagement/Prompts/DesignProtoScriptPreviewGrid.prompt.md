# Design a ProtoScript Preview Grid

Use this prompt when a Buffaly UI should render a grid/table whose data is produced by a live ProtoScript method.

## Preferred Native DataTable Flow

For native `System.Data.DataTable` values, do not use `ResponseResultType = "ProtoScriptPreviewGrid"` as the primary mechanism. Treat the boxed native prototype token as the UI reference.

A tool may return a boxed native value token such as:

```text
System.Data.DataTable[af9d02436d0a482bbc8cde032e5ddcc3]
```

Assistant-visible text should render it with a semantic `protoscript` ref while preserving the token exactly:

```text
[[protoscript:System.Data.DataTable[af9d02436d0a482bbc8cde032e5ddcc3]|Transcript Index]]
```

The browser tokenizes semantic refs by scanning from `[[` to `]]`, so bracketed prototype names remain intact. Do not alter, escape, normalize, or reformat the prototype token.

The JavaScript renderer calls the existing ProtoScript method API:

```javascript
BuffalyAgentService.RunProtoScriptMethodAsync(
	sessionKey,
	"TabularDataGrid",
	"PreviewNativeDataTable",
	JSON.stringify({
		table: "System.Data.DataTable[af9d02436d0a482bbc8cde032e5ddcc3]",
		offset: 0,
		limit: 100
	})
);
```

`TabularDataGrid.PreviewNativeDataTable(DataTable table, int offset, int limit)` accepts the boxed native reference through shared Buffaly argument binding and returns preview-grid JSON.

## Legacy Result-Type Flow

`ResultType = "ProtoScriptPreviewGrid"` remains a compatibility adapter for older messages and non-native renderer payloads. New native DataTable workflows should prefer refs like `[[protoscript:System.Data.DataTable[af9d02436d0a482bbc8cde032e5ddcc3]|DataTable Preview]]` with a user-friendly label.

Legacy payloads still use PascalCase fields:

```json
{
  "SessionKey": "<session>",
  "PrototypeName": "BuffalySamplePreviewGrid",
  "MethodName": "Preview",
  "Args": {},
  "Title": "Sample Preview Grid"
}
```

The legacy JavaScript handler delegates to the shared pluggable preview-grid module.

## Expected ProtoScript Return JSON

```json
{
  "Columns": [
    { "Key": "Name", "Label": "Name" },
    { "Key": "Amount", "Label": "Amount" }
  ],
  "Rows": [
    { "Name": "Alpha Clinic", "Amount": 125.50 },
    { "Name": "Beta Lab", "Amount": 89.00 }
  ]
}
```

## Renderer Rules

- Do not inline table rows into assistant text.
- Do not ask the model to generate row JSON.
- For native DataTables, emit refs like `[[protoscript:System.Data.DataTable[af9d02436d0a482bbc8cde032e5ddcc3]|DataTable Preview]]` with a user-friendly label when possible.
- Preserve the boxed native prototype token exactly.
- The browser must call `RunProtoScriptMethodAsync`, not a native-type-specific service method.
- Show a loading state while the ProtoScript call is in flight.
- On failure, show an explicit error in the grid card and route unexpected errors to `Page.HandleUnexpectedError` where appropriate.
- Keep the v1 data contract simple: returned JSON text with required `Rows` and optional `Columns`, where `Columns` entries use `Key` and `Label`.
