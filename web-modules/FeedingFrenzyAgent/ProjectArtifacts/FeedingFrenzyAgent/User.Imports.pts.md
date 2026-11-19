# User.Imports.pts

References and imports for the Feeding Frenzy User role entries.

## History

### 2026-11-19 - Initial User imports

- **What:** Same contract as the core OpsAgent `User.Imports.pts`: Prototype, String, Bool and Int wrappers, the Host User facades (memory, annotations, discovery, sessions, plan, borrow) and the environment helper functions. Adds the two opted-in Feeding Frenzy facades, `FeedingFrenzyUserJsonWs` and `FeedingFrenzyLeadEvidenceTools`, from the installed `FeedingFrenzy.Agent.Tools` assembly.
- **Why:** Host `UserSharedGraph` allows User source to import only these wrapper types and `[UserEnvironmentFacade]` types. The Root `Imports.pts` imports types User source cannot use.
- **Validation actually performed:** import scan in `FeedingFrenzyUserEnvironmentTests` (92/92 run).
- **Limitation:** the installed-assembly reference check and compilation are proven only by the staging launch.
