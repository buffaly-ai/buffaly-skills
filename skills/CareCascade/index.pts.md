# CareCascade skill

Defines the CareCascade MedOnt ICD-10 JsonWS skill and published service binding.

## Actions

- `ToSearchCareCascadeIcd10Codes` calls `GetICDCodesBySearch` for text-to-ICD-10 candidate lookup.
- `ToSearchCareCascadeIcd10CodesWithHierarchy` calls `GetICDCodesBySearchWithHierarchy` for hierarchical ICD-10 search results.
- `ToGetCareCascadeIcd10CodeDetails` calls `GetICDCodeByCodeDetails` for one ICD-10 code.
- `ToGetCareCascadeIcd10SpecialtyCapability` calls `GetSpecialtyCapability` to map one ICD-10 code to APCM/RTM/CCM/RPM flags.

## Service contract

Use `CareCascadeIcd10JsonWsService#Published` for the public API at `https://api.carecascade.com`.
The service reads `CareCascade.ApiKey` from UserSecrets via `TokenKey`. The API was observed open, but the tools intentionally keep the secret-backed auth path ready for future enforcement.

## JsonWS shape

The live API requires route-based POST calls where the JSON body includes `Method` plus method parameters. `JsonWsHelper.CallJsonRouteSecure` supplies the HTTP transport, including the secret-backed bearer token path.

## Provider-neutral discovery phrases

Added generic ICD-10 and medical-workflow infinitives so callers can discover the tools without naming CareCascade. Examples include finding ICD-10 codes for diagnosis text, resolving diagnosis code details, and checking RPM/CCM/RTM/APCM eligibility from ICD-10 codes.

## Workflow-oriented discovery phrases

Added patient-import enrichment and care-program routing infinitives. Free-text workflows route to ICD-10 candidate search first; already-coded patient workflows route to specialty capability classification.

## SNOMED CT actions

The CareCascade skill also exposes the production SNOMED CT JsonWS service through `CareCascadeSnomedJsonWsService#Published` at `https://api.carecascade.com/api/buffaly.medont/sno-med-service`.

- `ToSearchCareCascadeSnomedConceptsExact` calls `search-concepts-exact` for exact concept ID or exact term lookup.
- `ToSearchCareCascadeSnomedConceptsBroad` calls `search-concepts-broad` for ranked, deduplicated broad term search with a caller-specified result cap.
- `ToGetCareCascadeSnomedConcept` calls `get-concept` for the full concept payload, including preferred term, fully specified name, synonyms, direct children, ancestors, and linked ICD-10 codes.
- `ToGetCareCascadeSnomedChildren` calls `get-children` for direct active is-a children.
- `ToGetCareCascadeSnomedAncestors` calls `get-ancestors` for the transitive active is-a ancestor chain.
- `ToGetCareCascadeSnomedSynonyms` calls `get-synonyms` for active synonym terms.
- `ToGetCareCascadeSnomedLinkedIcd10Codes` calls `get-linked-icd-10-codes` for SNOMED-to-ICD-10 map targets.

SNOMED concept IDs are represented as strings in ProtoScript action signatures because the current ProtoScript compiler does not support `long` parameter types in skill action declarations. The JSON payload still passes numeric concept IDs to the MedOnt service route.

Production validation on 2026-07-07 confirmed the public proxy is live, exact search for `409794001` returns `Resistant fungi`, broad search for `diabetes` returns 20 results, `409794001` has 3 synonyms and 4 ancestors, `2751001` returns linked ICD-10 codes, and child traversal is proven with parent concept `414561005` returning 25 direct Fungi children. Concept `409794001` has zero direct children in the restored production snapshot.

