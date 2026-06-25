# TabularData Skill

Reusable native `System.Data.DataTable` operations and `ProtoScriptPreviewGrid` adapters.

## Design
- Core TabularData functions accept and return native `DataTable` references.
- The preview-grid boundary returns only PascalCase JSON with `Columns`, `Rows`, `Key`, and `Label`.
- CSV file and URL sources are provided as DataTable producers.
- Stored-procedure execution is kept in the separate `TabularDataStoredProcedureSource` helper and separate ProtoScript prototype so it can be removed independently later.
- No custom opaque handle registry is introduced; ProtoScript carries the native DataTable object reference.

## Operation JSON Contracts

All JSON operation payloads use PascalCase property names and exact source column names.

### Select Columns

```json
["source", "title", "meetingDate"]
```

### Sort Rows

```json
[
  { "Column": "meetingDate", "Direction": "Descending" },
  { "Column": "title", "Direction": "Ascending" }
]
```

`Direction` must be `Ascending` or `Descending`. Multiple sort entries are applied in order.

### Filter Rows

```json
[
  { "Column": "title", "Operator": "Contains", "Value": "FairPath" },
  { "Column": "meetingDate", "Operator": "GreaterThanOrEqual", "Value": "2026-06-01" }
]
```

Supported operators: `Equals`, `NotEquals`, `Contains`, `StartsWith`, `EndsWith`, `GreaterThan`, `GreaterThanOrEqual`, `LessThan`, `LessThanOrEqual`, `IsNull`, `IsNotNull`.

Multiple filters are ANDed.
