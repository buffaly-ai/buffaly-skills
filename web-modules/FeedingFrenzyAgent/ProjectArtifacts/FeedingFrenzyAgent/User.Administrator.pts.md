# User.Administrator.pts

User-environment entry for the `feeding-frenzy-administrator` profile (`UserProjectFilePath`).

## History

### 2026-11-19 - Initial User administrator entry

- **What:** Includes `User.Imports.pts`, `User.Annotations.pts`, `Core/SharedOntology.pts`, `Core/Service.pts`, `Skills/FeedingFrenzyJsonWs/User/Administrator.pts`, `Skills/FeedingFrenzyAgent/index.pts` and `Nodes/Personal/index.pts`. The last one is mounted from the user's PersonalRoot by the Host; it is not in this project, which is expected.
- **Why:** New authenticated administrator chats run here. Existing Root conversations keep `Administrator.pts`.
- **Validation actually performed:** profile, include and parity tests in `FeedingFrenzyUserEnvironmentTests` (92/92 run).
- **Limitation:** compilation is proven only by the staging launch.
