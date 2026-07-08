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
## SNOMED CT handoff and usage guide

Use the CareCascade SNOMED tools when a workflow needs native SNOMED CT lookup, concept details, hierarchy navigation, synonyms, or linked ICD-10 map targets from the production CareCascade MedOnt API. Do not call the JsonWS HTTP route manually from normal agent workflows when the typed CareCascade actions are available; discover and invoke the typed actions instead.

### Service binding

- Production service prototype: `CareCascadeSnomedJsonWsService#Published`
- Base URL: `https://api.carecascade.com/api/buffaly.medont/sno-med-service`
- JavaScript proxy: `https://api.carecascade.com/JsonWS/Buffaly.MedOnt.SnoMedService.ashx.js`
- The skill uses `JsonWsHelper.CallJsonRouteSecure` with the service `TokenKey` path so bearer-token auth is ready if the API enforces it later.
- SNOMED concept IDs in ProtoScript action signatures are strings, not `long`, because the current ProtoScript compiler does not support `long` parameter types in skill declarations. Pass numeric-looking concept IDs as strings to the typed action; the service route receives the numeric concept ID in JSON.

### Recommended action selection

1. If the user gives a known SNOMED concept ID or exact phrase, use `ToSearchCareCascadeSnomedConceptsExact` first.
2. If the user gives broad clinical text, a diagnosis phrase, or a partial term, use `ToSearchCareCascadeSnomedConceptsBroad` with a reasonable cap such as `10`, `20`, or `50`.
3. After selecting a concept, use `ToGetCareCascadeSnomedConcept` for the complete payload when the workflow needs preferred term, fully specified name, synonyms, children, ancestors, and ICD-10 links together.
4. Use the narrower hierarchy/synonym/map actions when only one projection is needed:
   - `ToGetCareCascadeSnomedChildren`
   - `ToGetCareCascadeSnomedAncestors`
   - `ToGetCareCascadeSnomedSynonyms`
   - `ToGetCareCascadeSnomedLinkedIcd10Codes`
5. For ICD-10-only workflows that start from an ICD-10 code or diagnosis-code eligibility question, continue using the existing ICD-10 actions rather than SNOMED.

### Typed action reference

- `ToSearchCareCascadeSnomedConceptsExact(service, query)`
  - Service: normally `CareCascadeSnomedJsonWsService#Published`.
  - Query: concept ID text such as `409794001` or an exact term.
  - Returns a JSON string containing exact SNOMED search result objects.

- `ToSearchCareCascadeSnomedConceptsBroad(service, query, maxResults)`
  - Query: broad clinical text such as `diabetes`, `resistant fungi`, or partial diagnosis wording.
  - `maxResults`: caller-selected cap; use `20` for normal interactive work.
  - Returns ranked JSON search results.

- `ToGetCareCascadeSnomedConcept(service, conceptId)`
  - `conceptId`: SNOMED CT concept ID as a string.
  - Returns the full concept JSON payload with details, synonyms, direct children, ancestors, and linked ICD-10 codes.

- `ToGetCareCascadeSnomedChildren(service, conceptId)`
  - Returns direct active is-a children only. It does not return descendants recursively.

- `ToGetCareCascadeSnomedAncestors(service, conceptId)`
  - Returns the transitive active is-a ancestor chain.

- `ToGetCareCascadeSnomedSynonyms(service, conceptId)`
  - Returns active synonym terms.

- `ToGetCareCascadeSnomedLinkedIcd10Codes(service, conceptId)`
  - Calls route `get-linked-icd-10-codes`.
  - Returns SNOMED-to-ICD-10 map targets from `ExtendedMapSnapshot` as a JSON string array.
  - Empty array is valid when the concept has no ICD-10 map.

### Known validated examples

- Exact search: `ToSearchCareCascadeSnomedConceptsExact(CareCascadeSnomedJsonWsService#Published, "409794001")` returns concept `409794001`, preferred term `Resistant fungi`, fully specified name `Antimicrobial resistant fungi (organism)`.
- Broad search: `ToSearchCareCascadeSnomedConceptsBroad(CareCascadeSnomedJsonWsService#Published, "diabetes", 20)` returns 20 diabetes-related ranked results.
- Concept details: `ToGetCareCascadeSnomedConcept(CareCascadeSnomedJsonWsService#Published, "409794001")` returns 3 synonyms, 4 ancestors, 0 children, and 0 linked ICD-10 codes.
- Children traversal: `ToGetCareCascadeSnomedChildren(CareCascadeSnomedJsonWsService#Published, "414561005")` returns 25 direct Fungi children.
- Linked ICD-10 codes: `ToGetCareCascadeSnomedLinkedIcd10Codes(CareCascadeSnomedJsonWsService#Published, "2751001")` returns `E13.9`, `E46`, `K86.89`, `E08.69`, and `K86.8`.

### Important acceptance correction

Concept `409794001` has zero direct children in the restored production SNOMED snapshot. Do not use `409794001` as a positive child-count assertion. Use `414561005` to validate positive direct-child traversal.

### Troubleshooting

- If the linked ICD-10 action fails with 404, verify the route is exactly `get-linked-icd-10-codes`; the variant `get-linked-icd10-codes` is invalid.
- If all production SNOMED actions return empty or null despite the proxy being live, check SQL access for `IIS APPPOOL\api.carecascade.com` on the production `snomed` database.
- If ProtoScript compile diagnostics mention unknown type `long`, confirm the skill action concept ID parameters are declared as `string`.
- If action discovery does not find SNOMED actions, search with phrases such as `to search SNOMED concepts`, `to get SNOMED concept details`, or `to get SNOMED ICD codes` and confirm the active skill package has been reloaded.

