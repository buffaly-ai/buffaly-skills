# Core/SharedOntology.pts

Base ontology (BaseObject, SemanticEntityBase, ProtoScriptAction, PromptAction and related prototypes) for the Feeding Frenzy User role entries.

## History

### 2026-11-19 - Initial User base ontology

- **What:** Same definitions as the core OpsAgent `Core/SharedOntology.pts`. Prompt reads and the authoring contract go through the `User.Imports.pts` environment functions.
- **Why:** The Root `Core/CoreOntology.pts` reads prompts and runtime state through `_opsAgent`, which User source may not reach.
- **Validation actually performed:** forbidden-token scan in `FeedingFrenzyUserEnvironmentTests` (92/92 run). The scan blanks string literals, so the error text `_opsAgent runtime is not available.` at line 40 is not a reference.
- **Limitation:** compilation is proven only by the staging launch.
