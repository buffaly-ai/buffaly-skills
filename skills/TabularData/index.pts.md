# TabularData Skill History

## Initial Native DataTable Skill (2026-06-06)
- Added a shared TabularData skill for native `DataTable` deterministic operations and `ProtoScriptPreviewGrid` JSON rendering.
- Kept source-specific loading/preview actions and stored-procedure support out of this skill boundary; sources produce DataTable references and TabularData operates on them.

## Structured Preview Grid Args (2026-06-06)
- Updated the sample grid action result payload to carry structured `Args` instead of string-built `ArgsJson` so preview-grid calls do not corrupt path or request values through JSON escape handling.

## Source Tools And Parameterized Preview Actions (2026-06-06)
- Added `CsvDataSourceSkill` actions for CSV file/URL sources that return native `DataTable` references while keeping those source actions outside `TabularDataSkill`.
- Renamed preview conversion actions to `ToPreviewDataTable` and `ToPreviewDataTablePage` and removed the public `requestJson` parameter from those TabularData preview actions.

## Native Value Grid Callback (2026-06-07)
- Removed the sample-specific `ToPreviewTabularDataSampleGrid` result-type action from the TabularData skill.
- Added `TabularDataGrid.PreviewNativeDataTable(DataTable table, int offset, int limit)` so UI renderers can hydrate boxed native DataTable semantic refs through the existing `RunProtoScriptMethodAsync` callback path.
- Design decision: grid rendering now uses the boxed native DataTable reference as the UI handle instead of `ProtoScriptPreviewGrid` result metadata.

## Shared OpsAgent Library Reference (2026-06-08)
- Changed the TabularData tool assembly reference from the skill-local `lib/Buffaly.Agent.Tools.TabularData.dll` path to the shared OpsAgent library name-based reference `Buffaly.Agent.Tools.TabularData`.
- This matches the common tool DLL deployment pattern where the staging update script builds the tool project and copies the resulting DLL into the shared OpsAgent `lib` folder.

## Remove Skill-Local TabularData DLL (2026-06-08)
- Removed the checked-in skill-local `Skills/TabularData/lib/Buffaly.Agent.Tools.TabularData.dll` copy after switching the ProtoScript reference to the shared OpsAgent library reference.
- This prevents stale skill-local assemblies from shadowing or mismatching the current DLL built and deployed by the staging update chain.

## Default Core Entity Surface Cleanup (2026-06-20)
- Removed `CoreEntity` from `CsvDataSourceSkill` and `TabularDataSkill` so tabular-data skills remain discoverable through skill/action search without appearing in the default ontology prompt surface.
- Kept grid callback prototypes on `SemanticEntityBase` rather than parentless so `Description` remains a valid inherited field without reintroducing `CoreEntity`.
