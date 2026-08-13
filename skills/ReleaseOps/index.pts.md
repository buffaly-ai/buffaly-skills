# ReleaseOps skill history

## 2026-07-27

Added the Provisioning-owned executable `ToDeployOneBuffalyExtensionToStagingSkill`. The action accepts one registered `SourceId`, `PackageType`, and `PackageId`, delegates to the external ReleaseOps coordinator client, and deliberately provides no installer-build or update-all fallback.

Changed the client reference to an explicit skill-local `lib/Buffaly.ReleaseOps.Client.dll` path so obsolete same-name assemblies in the OpsAgent project root cannot shadow newer coordinator methods during ProtoScript compilation.

## 2026-08-01

Changed the reference to assembly-name form because extension repository validation rejects path-based DLL references. Package installation still places the skill-owned client in its declared library payload, while ProtoScript resolves the canonical assembly identity without embedding a filesystem route.

## 2026-08-07

Promoted source-local extension-operation waiting into `ToWaitForExtensionOperation`, backed by the typed ReleaseOps client. Promoted immutable installer Build-ID monitoring and persisted evidence retrieval into `ToMonitorInstallerBuildProgress` and `ToExtractInstallerBuildEvidence`. These actions use ReleaseOps APIs and exact identities rather than session-local filesystem parsing.

## 2026-08-13

Rebuilt the tracked skill-local `lib/Buffaly.ReleaseOps.Client.dll` from the authoritative Release client source after installer submission gained immutable extension-preflight binding. The executable payload now reads the ready preflight snapshot and posts its exact `extensionPreflightToken`; source updates are not delivered until this tracked DLL is rebuilt and committed with them.
