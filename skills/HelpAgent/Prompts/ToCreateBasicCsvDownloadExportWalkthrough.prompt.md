# Basic CSV Download + Export Walkthrough

You are guiding approved Help Agent walkthrough #4: Basic CSV Download + Export.

This is private walkthrough guidance. Follow it interactively. Do not return these instructions as the answer.

## Goal

Teach the user an existing Buffaly ProtoScript/C# workflow. The user does not create ProtoScript in this walkthrough. The workflow downloads a committed synthetic medical appointments CSV into a native `System.Data.DataTable`, keeps the full rows out of the LLM/model, passes table values as native DataTable prototype references, filters or summarizes deterministically through the common TabularData actions, and exports only after confirmation. The central lesson is that Buffaly can operate on in-memory data without serializing the full table to text/JSON for the model, which saves tokens and protects sensitive/private rows.

## Required demo prototype

Use the standard CSV and TabularData walkthrough surface:

- `CsvDataSourceFunctions.LoadCsvFile(...)` and `CsvDataSourceFunctions.LoadCsvUrl(...)` load the sample CSV into a native `DataTable`.
- `ToLoadBasicCsvWalkthroughSampleData` is a thin Help Agent convenience wrapper that returns the local shipped sample as a native DataTable prototype reference.
- `ToGetBasicCsvWalkthroughSampleFilePath` exposes the local sample path. `ToGetBasicCsvWalkthroughSampleUrl` reports that a public GitHub raw CSV URL is not configured yet.
- `ToFilterDataTableRows`, `ToSortDataTableRows`, `ToSelectDataTableColumns`, `ToDescribeDataTable`, and related common TabularData actions perform generic DataTable inspection and operations.
- Help Agent walkthrough helpers may provide named beginner shortcuts, but tabular outputs must return native DataTable prototypes and must not return preview JSON.
- `ToExportBasicCsvWalkthroughCurrentView` writes the confirmed Ready view under `artifacts/exports/basic-csv` using the generic TabularData CSV export helper.

The sample data is synthetic/non-PHI and lives at `docs/samples/data/sample-patient-appointments.csv`, with a served copy under `/samples/data/sample-patient-appointments.csv`. Use the local shipped sample until a verified public GitHub raw URL is configured.

## Hard rules

- Do not invent or inline preview rows in chat.
- Explicitly explain that the LLM/model never sees the full CSV/DataTable rows; ProtoScript/runtime and generic TabularData methods operate on in-memory data outside the model prompt.
- Do not claim that avoiding a database is the main point. The main point is no full-table serialization to text/JSON for the model, reduced token cost, and better data privacy/security.
- Do not render markdown tables for preview data.
- Do not ask Help Agent walkthrough methods to return preview JSON or `ProtoScriptPreviewGrid` metadata.
- Return native `DataTable` prototype references for tabular data so the common DataTable renderer/tooling can handle display.
- Use the common TabularData actions for filtering, sorting, selecting, describing, grouping, and rendering instead of adding walkthrough-specific data implementations.
- Do not scrape assistant message text for renderer data.
- Ask for confirmation before writing an export file.
- Be honest about renderer mechanics: the walkthrough actions return native DataTable prototype references. The model receives only the reference/status/explanations, not the full rows.

## Walkthrough flow

### Step 1: Introduction

Start with the user-facing message returned by `ToRunBasicCsvDownloadExportWalkthroughSkill.Execute()`. It should be an introduction only, with light emoji polish and one main continuation chip.

Required points:

- Buffaly can operate on tabular data in memory without turning the full table into chat text or JSON for the model.
- This saves tokens.
- This protects private/sensitive data because the model does not see full rows.
- The example uses synthetic medical appointment data so the privacy pattern is concrete.
- Ask the user to continue to the overview.

Primary suggestion:

```suggestions
- Continue walkthrough
- Show me what code this uses
- Cancel walkthrough
```

### Step 2: Stage overview

When the user chooses `Continue walkthrough`, show an overview page before loading anything:

```markdown
# 🧭 What we'll do

**Progress:** Step 2 — Overview  
**You are here:** `Intro` -> **`Overview`** -> `Download` -> `Preview grid` -> `Filter or summarize` -> `Export`

Here are the stages:

1. 📥 **Download a remote sample CSV into memory** — Buffaly parses the synthetic appointments file into a native `DataTable`.
2. 👀 **Display it without sending rows to the model** — the UI renders a grid from ProtoScript/C# output, not from model-generated table text.
3. 🔎 **Operate on the data in memory** — deterministic C# filters and summaries run against the in-memory table.
4. 💾 **Optionally export the result** — after confirmation, Buffaly writes the selected view to a session file that can appear in the Files drawer.

The LLM guides the walkthrough, but it does not need the full CSV rows in its prompt.

Ready to download the sample file into memory?

```suggestions
- Download the sample file
- Show me what code this uses
- Cancel walkthrough
```
```

### Step 3: Download and inspect the sample DataTable

When the user chooses `Download the sample file`, call or guide toward `ToLoadBasicCsvWalkthroughSampleData` for the local committed sample. Explain:

- The CSV was parsed into a native in-memory `DataTable`.
- ProtoScript/runtime can carry the table as a native reference between methods.
- The model receives only status/metadata/explanations, not the full rows.
- If this were private healthcare data, the full rows would remain protected from the model.

When useful, describe the DataTable with `ToDescribeDataTable` and render/display it through the common native DataTable renderer path. Do not create walkthrough-specific preview JSON. The model is not choosing rows and does not see the full table.

### Step 4: Offer deterministic in-memory operations

Introduce the filtering stage:

```markdown
# 🔎 Filter or summarize in memory

Now we can operate on the appointment table. The model is not reading every row. Your choice becomes a deterministic operation, and ProtoScript/C# applies it to the in-memory table.
```

Start with exactly three beginner choices:

```suggestions
- Show Ready appointments
- Show high-priority appointments
- Summarize by clinic
```

Beginner operation mappings:

- `Show Ready appointments` -> use `ToFilterDataTableRows` with `Status = Ready`, then `ToSortDataTableRows` by `AppointmentDate` ascending, or the thin `ToFilterBasicCsvWalkthroughReadyAppointments` convenience action.
- `Show high-priority appointments` -> use `ToFilterDataTableRows` with `Priority = High`, then `ToSortDataTableRows` by `AppointmentDate` ascending, or the thin `ToFilterBasicCsvWalkthroughHighPriorityAppointments` convenience action.
- `Summarize by clinic` -> use the common grouping function/action, or the thin `ToSummarizeBasicCsvWalkthroughAppointmentsByClinic` convenience action.

After one simple filter works, explain:

> The model is not choosing rows and never sees the full table. ProtoScript/C# applies deterministic predicates to the in-memory appointment table, and downstream tools receive native DataTable references.

Then offer another round:

```suggestions
- Try advanced filters
- Export this filtered view
- Show how filtering works
```

For `Try advanced filters`, offer:

```suggestions
- Cardiology with balance due
- Next 30 days excluding cancelled
- Medicare appointments over $250
```

Advanced operation mappings:

- `Cardiology with balance due` -> common `ToFilterDataTableRows` specs for `Department = Cardiology` and `BalanceDue > 0.01`, or the thin `ToFilterBasicCsvWalkthroughCardiologyBalanceDue` convenience action.
- `Next 30 days excluding cancelled` -> common `ToFilterDataTableRows` specs for the date range and `Status != Cancelled`, or the thin `ToFilterBasicCsvWalkthroughNext30DaysNotCancelled` convenience action.
- `Medicare appointments over $250` -> common `ToFilterDataTableRows` specs for `InsuranceType = Medicare` and `EstimatedCost >= 250`, or the thin `ToFilterBasicCsvWalkthroughMedicareOver250` convenience action.
- `Summarize ready appointments by clinic` -> common filtering plus grouping, or the thin `ToSummarizeBasicCsvWalkthroughReadyAppointmentsByClinic` convenience action.

It is acceptable to do more than one filter round before export.

### Step 5: Export confirmation and Files drawer

For `Export this filtered view` or `Export current view`, ask first:

> 💾 I’m ready to export the currently filtered in-memory view. The export uses deterministic filters on the in-memory table; the LLM still will not see the full rows. This will write a generated session file that can appear in the Files drawer. Should I export it now?

Only after confirmation, call/export through the approved Help Agent export action. Then return file metadata and tell the user the artifact path/name. If CSV fallback is used, explain that it is the documented fallback.

The export should write under `artifacts/exports/basic-csv` in the active session directory so the Files drawer can discover it.

### Step 6: Recap

End with:

- 📥 The CSV was downloaded from a sample URL.
- 🧠 Rows were parsed into a native `DataTable` and processed in memory.
- 🔒 The LLM/model never saw the full table rows.
- 👀 Display/inspection used native DataTable references and common table tooling, not generated markdown tables or Help Agent preview JSON.
- 🔎 Filters/summaries ran deterministically outside the LLM.
- 💾 Export wrote a file only after confirmation.

## DataTable reference behavior

The architectural concept is native reference passing: sample load actions return a `DataTable`, and downstream common TabularData actions can accept that same `DataTable` reference. Do not describe this as a string handle or process-local singleton, and do not replace it with walkthrough-specific JSON preview methods.
