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

## 2026-09-02

Promoted the reusable deployment ZIP artifact pattern from Online Action Critic session-local actions into ReleaseOps. Added `ToValidateDeploymentZipArtifact` and `ToCreateCleanRootedDeploymentZipFromPublish`, backed by typed C# helpers that create rootless deployment ZIPs from clean .NET publish output, validate required/forbidden/unsafe archive entries, compute SHA-256, and return structured JSON release evidence.

Promoted the reusable ALB TLS/revision validation pattern from the `Affinity Web Cutover` Online Action Critic session-local action into ReleaseOps. Added `ToValidateTlsAgainstAlbNodes`, backed by typed C# validation that resolves ALB node IPs, checks each hostname/IP pair with `curl --resolve`, verifies TLS, HTTP success, and expected revision content, and returns structured JSON release-cutover evidence.
