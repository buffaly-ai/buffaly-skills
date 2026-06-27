# To run the local RootTrax Metabase JSONWS workflow

Use this runbook when operating Metabase in Buffaly.Development through HTTP JSONWS (not local DLL materialization).

## Endpoint and method contract
- Base endpoint: `http://localhost:51938/JsonWs`
- Request shape (POST):
  - URL: `http://localhost:51938/JsonWs/<Service>.ashx`
  - Content-Type: `application/json; charset=utf-8`
  - Body: `{"Method":"<MethodName>","Params":{...}}`

## Verified service methods
- `RooTrax.VDB.Applications.ashx` -> `GetAll`
- `RooTrax.VDB.Databases.ashx` -> `GetDatabases`
- `RooTrax.VDB.Projects.ashx` -> `GetProjects`
- `RooTrax.VDB.Objects.ashx` -> `GetAll`

## Known Buffaly bindings
- Buffaly ApplicationID: `32`
- Buffaly.Voice ApplicationID: `1033`
- Buffaly.Voice ProjectID: `2046`
- Buffaly.Voice object IDs currently include:
  - VoiceMessage: `10817`
  - VoiceConversation: `10818`

## Operating policy
- Prefer JSONWS inspection and orchestration in this environment.
- Avoid local DLL-based materialization paths when they require unresolved kscript dependencies.
- If generation/materialization is required, execute in the canonical Metabase runtime where all dependent scripts are present.

## Ordered execution checklist
1. Confirm Metabase IISExpress site is running on `http://localhost:51938`.
2. List applications via `Applications.GetAll` and bind target app IDs.
3. List projects via `Projects.GetProjects` and bind target project IDs.
4. List objects via `Objects.GetAll` and bind object IDs by application and name.
5. Draft planned object/property/method/relationship changes and present for review.
6. Execute approved changes through JSONWS-capable host/runtime.
7. Validate resulting objects/tables/procedures/repositories via JSONWS and read-only SQL checks.

## Default response shape for planning
Return sections:
1. Endpoint Check
2. Context Binding
3. Planned Changes
4. Execution Steps
5. Validation Steps
6. Risks/Dependencies
