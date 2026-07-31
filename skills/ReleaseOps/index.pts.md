# ReleaseOps skill history

## 2026-07-27

Added the Provisioning-owned executable `ToDeployOneBuffalyExtensionToStagingSkill`. The action accepts one registered `SourceId`, `PackageType`, and `PackageId`, delegates to the external ReleaseOps coordinator client, and deliberately provides no installer-build or update-all fallback.

Changed the client reference to an explicit skill-local `lib/Buffaly.ReleaseOps.Client.dll` path so obsolete same-name assemblies in the OpsAgent project root cannot shadow newer coordinator methods during ProtoScript compilation.
