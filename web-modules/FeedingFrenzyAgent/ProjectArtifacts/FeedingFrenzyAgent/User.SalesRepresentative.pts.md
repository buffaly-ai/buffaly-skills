# User.SalesRepresentative.pts

User-environment entry for the `feeding-frenzy-sales-representative` profile (`UserProjectFilePath`).

## History

### 2026-11-19 - Initial User sales entry

- **What:** Includes `User.Imports.pts`, `User.Annotations.pts`, `Core/SharedOntology.pts`, `Core/Service.pts`, `Skills/FeedingFrenzyJsonWs/User/SalesRepresentative.pts`, `Skills/FeedingFrenzyAgent/index.pts` and `Nodes/Personal/index.pts`. The last one is mounted from the user's PersonalRoot by the Host; it is not in this project, which is expected.
- **Why:** New authenticated sales chats run here. Existing Root conversations keep `SalesRepresentative.pts`.
- **Validation actually performed:** profile, include and parity tests in `FeedingFrenzyUserEnvironmentTests` (92/92 run).
- **Limitation:** compilation is proven only by the staging launch.

## 2026-11-24 — Unified User workspace v1 design proposal

Include the same User.Workspace.Shared.pts before the existing private mount while preserving all existing CRM role imports/actions and profile ownership. Change IDs: C4,C5. Required acceptance: T1,T10,T12,T15.

Validation: proposed code only. Nonmutating patch and syntax checks are recorded in the design package; application compilation, runtime/provider/security tests, publication and deployment are not run. Preserve this design entry and append actual results before implementation delivery.

## 2026-11-24 — Implement shared User workspace composition

Includes the canonical portable User.Workspace.Shared.pts while preserving the restricted SalesRepresentative CRM graph, Root entry, authentication and existing permissions. Generated common sources come from the core exporter rather than an FF-specific implementation.

Actual validation: BuildOnly package assembly against the isolated current core SDK succeeded; all three packaged User roles strictly compile through real UserSourceComposition with zero diagnostics and artifact-only Recall/image modules. Export pins core 586bbfabc94b95521981a1a03f8ad702aa316ac6 and thirteen common files. Installed worker, CRM/provider and browser capability acceptance remain pending; compile success does not establish execution or isolation.
