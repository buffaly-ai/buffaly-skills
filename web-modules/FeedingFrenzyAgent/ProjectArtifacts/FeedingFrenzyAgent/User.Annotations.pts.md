# User.Annotations.pts

Semantic annotation functions for the Feeding Frenzy User role entries.

## History

### 2026-11-19 - Initial User annotations

- **What:** Same contract as the core OpsAgent `User.Annotations.pts`: `InfinitivePhrase`, scoped phrases, `SemanticEntity` and `SemanticTag` reconcile through `UserAnnotations.Reconcile`.
- **Why:** The Root `Annotations.pts` writes through `SemanticDatabase` and `_runtime`, which User source may not reach.
- **Validation actually performed:** forbidden-token scan in `FeedingFrenzyUserEnvironmentTests` (92/92 run).
- **Limitation:** compilation is proven only by the staging launch.
