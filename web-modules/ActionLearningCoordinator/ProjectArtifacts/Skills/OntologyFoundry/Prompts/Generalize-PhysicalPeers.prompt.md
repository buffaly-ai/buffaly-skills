# Ontology Foundry — Generalize from a Physical Seed

Use this procedure when one exact ontology object represents a real physical, deployed, configured, owned, or operational thing and you want to use its grounded relationships to discover and organize additional real objects.

Do not begin from a presumed complete family or its existing children. The family, organizing parent, peer set, and missing relationships are outputs of the investigation. This skill is plan-only and performs zero ontology or session-index writes.

## Inputs

- `sourceSessionKey` is required and names the exact Level1 session that owns the living EvidenceGraph.
- `seedPrototype` is required and must resolve exactly.
- Optional `relationshipHint` may name a likely grounding relation such as hosted-by, owned-by, contained-in, installed-in, registered-with, or stored-in.
- Optional `scopeHint` may bound one real system, account, host, repository, workspace, directory, installation, or service.
- `mode` defaults to `plan`. `apply-approved` is blocked until a scoped approval/backup/compile/restore coordinator exists.

## Artifact contract

Read and rewrite only the Level1 source's `artifacts/ontology-foundry/evidence-graph.md` through `ToReadOntologyFoundryEvidenceGraph(sourceSessionKey)` and `ToWriteOntologyFoundryEvidenceGraph(sourceSessionKey, markdown)`. Replace or add `## Generalization — <seedPrototype>` with all of these sections:

1. `### Seed and physical identity`
2. `### Grounding relationships`
3. `### Enumerator selection`
4. `### Discovered peer inventory`
5. `### Peer resolution and classification`
6. `### Organizing structure`
7. `### Exact object and relationship proposals`
8. `### Shared-structure analysis`
9. `### Validation and approval`

Do not create per-peer files, raw inventory exports, or a second artifact.

## Core algorithm

```text
exact real-world seed
→ inspect intrinsic identity and current relationships
→ discover an enclosing real system or authoritative owner
→ select an existing typed enumerator for that system
→ enumerate bounded real peers
→ resolve every peer against current ontology
→ classify existing/missing/wrongly organized objects
→ infer the natural parent and relationships
→ propose exact objects and typed links
```

The parent and family are usually conclusions, not required inputs.

## Procedure

1. **Anchor the seed.** Inspect exact details and full resolved schema. Record what physical, deployed, configured, owned, or operational thing it represents, including hard identity such as host, path, database name, account ID, repository identity, service endpoint, package identity, or registration key. If the seed is abstract and has no grounded operational identity, stop with `NoPhysicalAnchor` or request an explicit authoritative inventory source.
2. **Extract grounding relationships.** Inspect current assigned properties and exact bound neighbors for relations that can lead to a real enclosing system: hosted-by, belongs-to, owned-by, contained-in, installed-on, registered-in, provided-by, stored-in, part-of, source-repository, workspace/account, directory, server, runtime, or service. Do not assume the prototype parent is the real-world container.
3. **Select an enumerator.** Search available typed actions for the narrow operation that can list real objects from the enclosing system—for example databases on one SQL server, sites on one IIS host, repositories in one account, files in one Drive/workspace, installed modules in one installation, projects in one solution, or skills in one package source. Prefer an existing typed domain action. Do not use conversation frequency as inventory and do not invent a generic enumerator.
4. **Bind the enumeration scope.** Resolve every required host/account/workspace/server/repository/installation input to an exact ontology object or hard literal already present on the seed. If the enumerator needs credentials, use only existing secret names through the domain action; never retrieve or persist secret values in the artifact.
5. **Enumerate once, bounded.** Call the selected authoritative enumerator once for the exact scope. Preserve stable identities and only the fields needed to distinguish peers. Cap the candidate set at 100; if larger, record truncation and require a narrower scope.
6. **Normalize nothing away.** Preserve exact names, IDs, paths, environments, suffixes, and lifecycle markers. Active, staging, baseline, backup, system, generated, temporary, source, installed, and recovery copies are distinct until evidence proves otherwise.
7. **Resolve each peer.** Search current ontology with focused hard-identity and semantic queries, then inspect plausible prototypes. Compare physical identity, type, environment, owner/container, and lifecycle. Similar names or shared parent candidates are not proof.
8. **Classify every peer exactly once:**
   - `ExistingObject` — exact real peer already represented correctly;
   - `MissingObject` — durable real peer has no suitable prototype;
   - `WrongType` — object exists but models the wrong kind of thing;
   - `WrongParent` — exact object exists but its ontology organization obscures the natural family;
   - `MissingRelationship` — objects exist but the grounding/container/peer relationship is absent;
   - `SystemOrInfrastructureObject` — real but normally excluded or modeled under a system family;
   - `TemporaryOrGenerated` — backup, baseline, test, generated, recovery, or transient object not suitable as a durable peer;
   - `AmbiguousIdentity` — multiple plausible objects remain;
   - `NoBuild` — unsupported, duplicate, non-object, or not useful to model.
9. **Infer organizing structure after resolution.** From the seed plus verified peers, determine the narrowest existing ontology base that correctly represents the physical kind. Inspect its schema and direct descendants only now, as a collision and organization check—not as the discovery source. If no suitable base exists, propose a base only when at least two durable verified peers require it and existing bases cannot express their identity.
10. **Propose exact missing objects.** For each `MissingObject`, provide exact prototype name, selected parent, semantic names, hard identity assignments from enumerated fields, enclosing-system relationship, target personal file, duplicate checks, and validation searches. Do not invent unavailable values.
11. **Propose relationships separately.** For `MissingRelationship`, bind exact subject and object, inspect schema, and classify the relation as `declared-assignable`, `needs-base-extension`, or `reject`. Never hide structural relationships in Notes and never invent a field as if declared.
12. **Infer shared structure conservatively.** A shared property or parent change requires at least two verified durable peers plus exact schema evidence. One seed may discover peers but cannot alone justify a generalized base field. Record exceptions and lifecycle differences.
13. **Write one complete plan.** Include enumerator/tool identity, exact scope, bounded inventory, every peer classification, proposed organization, exact object/relationship proposals, negative evidence, validation, rollback expectations, and canonical approval digest input.
14. If `mode=apply-approved`, write `ApplyBlockedGuardUnavailable` and stop. Do not call ontology authoring, file editing, backup, compile, restore, or session-index tools. Never auto-call ProposeBuild or Expand-and-Enhance.

## Output tables

### Grounding relationships

`Seed | Current relation/property | Enclosing object/literal | Resolution | Can enumerate? | Evidence`

### Enumerator selection

`Candidate action | Required scope | Why authoritative | Selected? | Rejection reason`

### Discovered peer inventory

`PeerID | Raw identity | Physical kind | Lifecycle/environment | Enclosing system | Enumerator evidence`

### Peer resolution and classification

`PeerID | Existing prototype/candidates | Hard-identity comparison | Classification | Reason`

### Organizing structure

`Physical kind | Proposed existing parent | Current direct leaves checked | Fit/gap | Evidence`

### Exact object and relationship proposals

`ProposalID | Kind | Prototype/Subject | Parent/Field | Exact typed assignments/Object | Target file | Evidence | Validation`

### Shared-structure analysis

`Candidate structure | Verified peers | Exceptions | Schema evidence | Decision | Reason`

## Grounded patterns

- SQL database seed → its exact SQL server → typed list-databases action → physical database peers → classify system/temp/user databases → organize durable databases and server relations.
- IIS website seed → exact IIS host → typed list-sites action → deployed site peers → preserve live/staging/preview distinctions.
- Repository seed → exact account/organization → typed list-repositories action → repository peers → preserve forks, archived, template, and generated repositories.
- Installed module seed → exact installation/runtime → typed module inventory → installed peers. This is one instance of the general algorithm, not a special case.

## Done

Done means the seed has a proven real-world identity, one authoritative enclosing scope and enumerator were selected or a precise blocker recorded, every discovered peer has an auditable classification, ontology parents were inspected only after peer discovery, exact missing-object and relationship proposals are grounded in enumerated hard identities, shared structure is supported by multiple verified peers, and zero ontology or index writes occurred.
