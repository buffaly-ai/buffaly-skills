# In-Memory Data Filtering ProtoScript Walkthrough

You are guiding approved Help Agent walkthrough #5: In-Memory Data Filtering.

This walkthrough teaches Buffaly's architectural advantage: large data can stay in memory and be processed by deterministic tools without sending the full dataset to the LLM.

This is private walkthrough guidance. Follow it interactively. Do not return these instructions as the answer.

## What we're building

We are building a ProtoScript action named `FilterLargeDataset`.

The finished action will:

- load sample CSV data into memory as a `DataTable`;
- pass the in-memory table to a native filtering/query step;
- return only the filtered result or a small summary;
- avoid sending the full dataset to the LLM.

This walkthrough teaches why in-memory processing is faster, cheaper, and safer than pushing large datasets through chat.


## Goal

Help the user understand:

- ProtoScript can pass object references between tools;
- a CSV can be downloaded into memory as a DataTable;
- filtering can happen natively without sending the full dataset to the LLM;
- the user sees only the filtered result or summary.

## Safety and scope

- Use sample public CSV data.
- Do not write data to disk unless the user asks.
- Do not send the full dataset to the LLM.
- If required in-memory data tools are unavailable, show the intended flow and code shape without pretending it ran.

## Walkthrough flow

### Step 1: Teach the concept

Say:

`This walkthrough shows why ProtoScript is useful for real data. The data can stay in memory while native tools filter it. The LLM only sees the small result you choose to show.`

What you're teaching:

This reduces token cost, latency, and privacy risk.

### Step 2: Show the pipeline

Show:

| Step | What happens | LLM involvement |
|---|---|---|
| 1 | Download CSV into a DataTable | None |
| 2 | Pass the DataTable reference to a filter tool | None |
| 3 | Apply a simple filter | None |
| 4 | Return only filtered rows or a summary | Small result only |

Ask whether to continue.

```suggestions
- Continue with the filtering example
- Explain in-memory data
- Change the filter idea
```

### Step 3: Show the action proposal

Propose:

- Action name: `FilterLargeDataset`
- Purpose: load sample CSV data into memory, filter it natively, and return a small result.
- Example filter: rows where a numeric value is greater than a threshold.

### Step 4: Show the code shape

```csharp
[SemanticProgram.InfinitivePhrase("to filter a large dataset in memory")]
prototype FilterLargeDataset : OpsAction
{
    function Execute(string csvUrl, string columnName, double minimumValue) : string
    {
        var table = DownloadCsvAsDataTable.Execute(csvUrl);
        var filtered = FilterDataTableRows.Execute(table, columnName, minimumValue);
        return FormatDataTablePreview.Execute(filtered, 20);
    }
}
```

Explain that the code is mostly wiring: download, filter, format.

### Step 5: Recap

End with:

`The important idea is that the full dataset never needed to become chat text. ProtoScript passed data between native tools in memory and returned only the useful result.`
