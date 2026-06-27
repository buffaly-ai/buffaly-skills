# To use RootTrax Metabase for application, object, and data/repository scaffolding

You are operating at the **RootTrax Metabase model layer** (Application / Project / Feature / Object), not low-level manual SQL scripting.

## Canonical ontology and row-class mapping
Use these conceptual entities and keep terminology RootTrax-prefixed:

- RootTraxApplication -> RooTrax.VDB.DB.ApplicationsRow
- RootTraxProject -> RooTrax.VDB.DB.ProjectsRow
- RootTraxFeature -> RooTrax.VDB.DB.FeaturesRow
- RootTraxObject -> RooTrax.VDB.DB.ObjectsRow
- RootTraxProperty -> RooTrax.VDB.DB.PropertiesRow
- RootTraxMethod -> RooTrax.VDB.DB.MethodsRow
- RootTraxRelationship -> RooTrax.VDB.DB.RelationshipsRow

## Concept model
- Application: conceptual umbrella for a business/domain product.
- Project: implementation vertical with connection + output conventions.
- Feature: reusable collection of objects shared across projects.
- Object: source-of-truth entity definition that drives data/proc/repository generation.

## Primary workflows (UI-aligned)
1. Create/select Application and Project context.
2. Create/select Object and define Properties.
3. Refine Methods and Relationships (manual + inferred).
4. Materialize object into project database (Implement Data).
5. Infer relationships / generate foreign keys.
6. Infer methods / generate stored procedures.
7. Generate repository from schema + relationships.

## LLM-assisted object creation
When user provides a high-level description, convert it into:
- object naming (singular/plural + friendly names),
- initial property set (IDs, names, status, audit fields, domain fields),
- initial relationship hypotheses,
- starter methods (CRUD + key GetBy patterns),
then return a draft plan before execution.

## Output contract for planning responses
Return sections:
1. Context Binding (Application, Project, optional Feature)
2. Object Modeling Plan (create/update/copy object; property edits)
3. Data Materialization Plan (Implement Data + relationship inference)
4. Procedure Plan (Infer Methods + Generate Stored Procs + custom inserts)
5. Repository Plan (namespace/output + method set)
6. Risks/Preconditions (name collisions, missing connection/project config)
7. Ordered Execution Checklist

## Guardrails
- Prefer Metabase workflow actions over manual SQL/table editing.
- Default to infer-and-validate before generation.
- Focus phase 1 on data layer + repository layer.
- Treat UI/screen generation and advanced JsonWs governance as phase 2 unless explicitly requested.

## Verified local Metabase JSONWS contract (Buffaly.Development)
- Base URL: `http://localhost:51938/JsonWs`
- Site source: `C:\dev\RooTrax.Creator\Metabase` (IISExpress site: `Metabase`)

### Verified services + methods
- `RooTrax.VDB.Applications.ashx` -> `GetAll`
- `RooTrax.VDB.Databases.ashx` -> `GetDatabases`
- `RooTrax.VDB.Projects.ashx` -> `GetProjects`
- `RooTrax.VDB.Objects.ashx` -> `GetAll`

### Request shape
POST `http://localhost:51938/JsonWs/<Service>.ashx`
Content-Type: `application/json; charset=utf-8`
Body:
`{"Method":"<MethodName>","Params":{}}`

### Current Buffaly bindings (verified)
- `Buffaly` ApplicationID = `32`
- `Buffaly.Voice` ApplicationID = `1033`
- `Buffaly.Voice` ProjectID = `2046`
- `Buffaly.Voice` objects currently include:
  - `VoiceMessage` (ObjectID `10817`)
  - `VoiceConversation` (ObjectID `10818`)

## Operational guardrail for this environment
- Do **not** use local DLL-based materialization path when it requires unresolved kscript dependencies (`GenerateSchema3.ks`, `application.ks`, `common3.ks`, etc.).
- Prefer JSONWS inspection/planning and controlled remote-orchestrated generation workflows.
- If materialization is required, execute it from the canonical Metabase host/runtime that owns the full kscript dependency set.

## Phase-1 (voice/sms) runbook in this environment
1. Resolve app/project/object context from JSONWS (`Applications/GetAll`, `Projects/GetProjects`, `Objects/GetAll`).
2. Validate/prepare `VoiceMessage` + `VoiceConversation` schema at the object-definition layer.
3. Identify reusable `Message` object source candidates by ApplicationID and LastUpdated.
4. Produce a reviewable diff plan (properties/methods/relationships) before generation.
5. Execute generation only on the canonical Metabase runtime; then verify resulting objects/tables/procedures/repositories via JSONWS + SQL read-only checks.
