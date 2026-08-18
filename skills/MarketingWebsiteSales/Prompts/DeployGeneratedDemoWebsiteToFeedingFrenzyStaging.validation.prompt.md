# Validate Generated Demo Website Staging Deployment

Validate that the work result safely deployed a generated sales/demo website to a real Feeding Frenzy staging/demo preview location and proved that the public preview is reachable.

## Objective checks

Fail if required deployment proof is missing:

- Identifies the source demo or packet artifact/folder and verifies it exists before packaging.
- Builds or identifies the package root with the correct layout, including a top-level `index.html` and the client-specific slug folder when required by the workflow.
- Uses a safe client-specific slug and confirms the deploy target path is scoped to that slug. Do not pass if files are copied to an ambiguous shared folder or unrelated client folder.
- Verifies the real remote/public target root before deployment. A local path that resembles the remote IIS path is not enough.
- Deploys files to the expected client-specific slug folder on the public demo host. A prepared package, local-only copy, or description of deployment steps is not enough to pass when publishing was requested.
- Provides the public preview URL, normally `https://demos.feedingfrenzy.ai/<slug>/`, and records the exact URL that was tested.
- Verifies the public preview URL returns HTTP 200 after deployment and records the HTTP status evidence.
- Verifies key linked artifacts return HTTP 200 when applicable, such as packet landing page, client report, proposal deck, demo site `index.html`, README, manifest, and ZIP/download links.
- Confirms manifest and sales-rep README contain the final staging/demo URL(s).
- Confirms the deployment is for sales/demo preview only, not the final client implementation source.
- Confirms no unrelated client folders were overwritten and no destructive overwrite occurred unless explicitly approved and scoped.
- Records deployment evidence such as remote file list, package/ZIP path, SSM/deployment command output, public HTTP validation output, screenshots, or equivalent validation notes.

If credentials, deployment tools, remote target, or public HTTP validation are unavailable, return validation failure with the exact blocker and safe next action. Do not pass a deployment that was only prepared, described, locally copied, or not publicly reachable.

## Public URL and link validation checks

Fail unless public reviewability is proven:

- The main preview URL must be fetched after deployment and return HTTP 200.
- Key linked artifacts on the landing page must be probed directly or through a documented link check.
- Any non-200 status, DNS/TLS error, authentication problem, missing file, redirect loop, or inaccessible linked artifact must fail with specific retry feedback.
- The validation result must include enough evidence for a user or sales rep to know which URL to open and which artifacts were verified.

## Subjective checks

Fail if the deployment is not reviewable or safe:

- The preview should be easy for a user or sales rep to open.
- The output should clearly communicate deployment status and any remaining risk.
- The workflow must not hide failed deployment checks behind vague success language.
- A customer-visible public preview should feel complete and intentional: the landing page should make the packet/demo easy to navigate, key links should work, and the URL should not expose confusing local/session-only paths.
- If screenshots are captured for deployment validation, they should show the public page rendering correctly without obvious broken styling, missing assets, or placeholder content.

When failing, `FeedbackForRetry` must name the missing deployment proof, remote target issue, unsafe slug/path, public URL failure, broken linked artifact, missing manifest/README URL, or overwrite risk and explain the exact correction needed.
