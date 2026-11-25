# User.Imports.pts

References and imports for the Feeding Frenzy User role entries.

## History

### 2026-11-19 - Initial User imports

- **What:** Same contract as the core OpsAgent `User.Imports.pts`: Prototype, String, Bool and Int wrappers, the Host User facades (memory, annotations, discovery, sessions, plan, borrow) and the environment helper functions. Adds the two opted-in Feeding Frenzy facades, `FeedingFrenzyUserJsonWs` and `FeedingFrenzyLeadEvidenceTools`, from the installed `FeedingFrenzy.Agent.Tools` assembly.
- **Why:** Host `UserSharedGraph` allows User source to import only these wrapper types and `[UserEnvironmentFacade]` types. The Root `Imports.pts` imports types User source cannot use.
- **Validation actually performed:** import scan in `FeedingFrenzyUserEnvironmentTests` (92/92 run).
- **Limitation:** the installed-assembly reference check and compilation are proven only by the staging launch.

### 2026-11-25 — Match the shared dispatcher's argument-only JSON contract

The regenerated core User.Actions.pts now exposes ToRunAction(prototypeName, JsonObject args). Added the exact BasicUtilities reference and JsonObject import from core User.Imports.pts. JsonObject is admitted by UserSharedGraph only as an argument value; this does not expose its native members, permit CRM wrappers to use it, or change CRM role permissions. The source is authored here rather than patched into the published package.

Validation: the rooted consumer suite first reproduced the stale contract (108 passed, one forbidden-JsonObject failure). After the import and exact-line contract-test correction, the full Release consumer suite passes 109/109, zero skipped. Explicit build-private SDK and hash-verified in-repository test binaries were used; initial unrooted/incorrect-SDK attempts are retained. Live authenticated Feeding Frenzy conversation acceptance remains separate and unproven.
