# RootTrax Metabase Ontology (High-Level)

## Purpose
Define a RootTrax-prefixed ontology for planning and operating Metabase-driven application scaffolding at the **application / project / feature / object** level, focused on data and repository generation workflows.

## Core Domain Concepts

### RootTraxApplication
- Meaning: top-level conceptual product/application boundary.
- Owns: objects, features, project families.
- Key intent: semantic grouping and long-lived business domain ownership.

### RootTraxProject
- Meaning: implementation vertical/slice inside an application.
- Owns: environment config, target database connection, output directories, generation settings.
- Uses: application objects directly and/or via features.

### RootTraxFeature
- Meaning: reusable bundle of objects and behaviors that can be shared across projects.
- Owns: feature-level object membership and optional generation presets.
- Enables: reuse, cross-project portability, consistency.

### RootTraxObject
- Meaning: canonical domain entity definition (source of truth for generated data/repository surfaces).
- Owns: properties, methods, relationships, naming conventions.
- Lifecycle: create -> enrich -> infer relationships -> materialize -> generate methods/repository/jsonws.

### RootTraxProperty
- Meaning: field/attribute definition on an object.
- Includes: type, nullability, defaults, constraints, semantic role (ID/name/status/data/etc.).
- Used by: table materialization, proc signatures, repository model shape.

### RootTraxMethod
- Meaning: operation contract associated with object behavior (CRUD + custom queries/commands).
- Includes: method name, backing proc, return cardinality, parameter map.
- Produced by: infer/basic generation and custom method insertion.

### RootTraxRelationship
- Meaning: directional association between source object and target object.
- Includes: relationship type, source/target key bindings, optional inferred status.
- Produced by: inference and/or explicit modeling.

## Object-Centric Workflow States
1. Drafted (object exists, minimal metadata)
2. Modeled (properties/method stubs/relationships defined)
3. Inferred (relationships/method candidates inferred from schema conventions)
4. MaterializedData (implemented into project database)
5. MaterializedRepository (repository generated from schema + relationships)
6. MaterializedApi (JsonWs/generated service surface emitted)
7. Integrated (object implemented into project UI/screens when needed)

## High-Level Operations (UI-Aligned)

### Application / Project / Feature Context
- Select or create application context
- Select project context (connection + directories)
- Bind object to project
- Bind/unbind object to feature
- Copy object into target scope (project/feature/application)

### Object Modeling
- Create object
- Edit object naming and metadata
- Add/edit/remove properties
- Add/edit/remove methods
- Add/edit/remove relationships
- Create object from LLM summary (guided high-level blueprint)

### Data Layer Materialization
- Implement object into project database (table + base schema realization)
- Infer relationships from connection/object
- Generate foreign keys (to DB or to file)

### Method / Procedure Layer
- Infer basic methods from object/schema
- Insert custom method patterns (GetBy single/multiple, UpdateBy, CustomGet)
- Generate all object stored procedures from method definitions

### Repository / API Layer
- Generate repository from schema + relationships
- Generate enum from selected property
- Generate JsonWs from schema/method definitions

### Project Integration
- Implement object data into project
- Implement object screens into project
- Remove object from project

## Relationship Model (Conceptual)
- RootTraxApplication 1-* RootTraxProject
- RootTraxApplication 1-* RootTraxObject
- RootTraxFeature *-* RootTraxObject
- RootTraxProject *-* RootTraxObject (implementation mapping)
- RootTraxObject 1-* RootTraxProperty
- RootTraxObject 1-* RootTraxMethod
- RootTraxObject *-* RootTraxObject (via RootTraxRelationship)

## Naming / Namespace Rules
- Prefix ontology entities and skill language with `RootTrax` for disambiguation.
- Keep UI action labels aligned to actual Metabase page capabilities.
- Separate conceptual ontology names from low-level SMO/SQL internals.

## Initial Skill/Prompt Focus (Data + Repository)
Priority capabilities:
1. Create/select application + project context
2. Create object and manage properties (manual + LLM-assisted)
3. Implement object into project database
4. Infer/generate relationships and foreign keys
5. Infer/generate methods + stored procedures
6. Generate repository from schema + relationships

Deferred to phase 2:
- Full JsonWs exposure governance
- UI screen generation governance
- Advanced migration/roll-forward orchestration
