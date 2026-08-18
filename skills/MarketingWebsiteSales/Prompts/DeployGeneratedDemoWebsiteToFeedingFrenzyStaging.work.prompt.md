> VALIDATED PROMPT ACTION ONLY
>
> Do not run this markdown file directly as ordinary prompt guidance.
> This prompt must be executed through the corresponding ProtoScript `ValidatedPromptAction` so the validation prompt runs after the work turn.
> If you are an agent, call the action/tool instead of loading this file directly.

# Deploy Generated Demo Website To Feeding Frenzy Staging

Use this prompt skill when the user wants to publish a generated static/demo website to the Feeding Frenzy demo host as part of the Website Growth Demo / lead-funnel workflow.

## Correction From Actual Deployment History

Do not invent a target like `https://staging.feedingfrenzy.ai/demos/<slug>/`.

The Insurance Associates demo was actually deployed to a dedicated IIS site and host:

- Public host: `https://demos.feedingfrenzy.ai/`
- IIS site name: `demos.feedingfrenzy.ai`
- Remote physical root: `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot`
- Demo URL pattern: `https://demos.feedingfrenzy.ai/<slug>/`
- Insurance demo example: `https://demos.feedingfrenzy.ai/insurance-associates/`

The slug folder sits directly under the demo site's web root. There is no `/demos/<slug>/` subfolder under `staging.feedingfrenzy.ai` in the process that was actually used.

## Remote Server Location

This is not a local IIS copy operation. The path `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot` is the physical path on the remote public Windows EC2 server behind `demos.feedingfrenzy.ai`, not a path on the agent's local machine.

Known current AWS Systems Manager target discovered from the deployed lead-funnel demo:

- AWS region: `us-west-2`
- SSM instance id: `i-050e51c92f600cf65`
- Windows host name from SSM probe: `EC2AMAZ-HL17G4A`
- Remote physical root: `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot`

Before publishing, verify the remote target through SSM instead of assuming any local folder is the destination. A safe probe is:

```powershell
[pscustomobject]@{
    Host = $env:COMPUTERNAME
    RootExists = (Test-Path 'C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot')
} | ConvertTo-Json
```

Only deploy to the instance where `RootExists` is `true`. If this instance id stops working, rediscover the SSM-managed Windows instance in `us-west-2` by probing for that same remote root. Do not satisfy this workflow by copying files to a local `C:\inetpub...` path.

## Goal

Safely take a generated static demo website artifact, package it in the same layout used by the Insurance Site workflow, publish it under `demos.feedingfrenzy.ai/<slug>/`, and capture validation evidence so the URL can be shown to the prospect or attached to a lead workflow.

## Sales packet deployment variant

When deploying a complete website analysis sales packet rather than only a demo homepage, the slug folder should be a packet landing page with links to the customer-facing assets.

Recommended packet layout:

```text
index.html
<slug>/index.html                     # sales packet landing page
<slug>/demo-homepage.html             # polished or selected demo homepage
<slug>/client-report/...
<slug>/proposal-deck/...
<slug>/sales-assets/annotated-improvements.*
<slug>/audit-evidence/...
<slug>/README-sales-rep.md
<slug>/manifest.json
```

The packet landing page should include a short opening angle, suggested review order, and plain-language explanation of each artifact. Before deployment, scan the landing page for internal/process wording such as `audit findings`, `SEO cleanup`, `schema-ready`, `template critique`, `task plan`, or `demo concept` and rewrite it as customer- or sales-rep-friendly language.

## When To Use

Use this for generated customer demo websites, lead-funnel preview sites, or sales/demo microsites.

Do not use this for deploying the legacy Feeding Frenzy Admin app itself. For the legacy admin staging deploy, use the existing Feeding Frenzy local IIS deployment action/workflow such as `ToDeployFeedingFrenzyToLocalIisAction` when appropriate.

## Inputs To Resolve

- Source demo folder or artifact path
- Prospect/business name
- Demo slug, if already chosen
- Whether this is a new demo or an update to an existing slug
- Whether the demo should be attached to a lead record or returned only as a URL
- Current upload mechanism for transferring the package to the public server, usually an S3 presigned URL plus AWS SSM command execution

If the user does not provide a slug, generate a safe lower-case slug from the business name or domain. Use only letters, numbers, and hyphens. Avoid collisions with existing demo folders unless the user is intentionally updating the same prospect demo.

## Actual Package Layout Used

The zip file should expand into the demo site's web root.

Expected zip layout:

```text
index.html
<slug>/index.html
<slug>/assets/...
```

For the Insurance Associates demo, the zip contained:

```text
index.html
insurance-associates/index.html
insurance-associates/assets/assuranceamerica-logo.png
insurance-associates/assets/auto-insurance.jpg
insurance-associates/assets/brand-logo.png
insurance-associates/assets/kemper-logo.png
insurance-associates/assets/progressive-logo.png
insurance-associates/assets/renters-insurance.jpg
insurance-associates/assets/team-local-agency.jpg
insurance-associates/assets/why-choose-us.jpg
```

The root `index.html` can be a simple landing/index page for the demo host. The prospect demo itself lives at `<slug>/index.html`.

## One-Time Host Setup That Was Actually Done

Use this only when the `demos.feedingfrenzy.ai` IIS site does not already exist.

1. Create/confirm the remote web root:

```powershell
$siteName = 'demos.feedingfrenzy.ai'
$root = 'C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot'
New-Item -ItemType Directory -Force -Path $root | Out-Null
```

2. Create/confirm IIS app pool and site with HTTP binding:

```powershell
$appcmd = "$env:windir\System32\inetsrv\appcmd.exe"
if (-not (Test-Path $appcmd)) { throw 'appcmd not found' }

& $appcmd list apppool /name:$siteName | Out-Null
if ($LASTEXITCODE -ne 0) { & $appcmd add apppool /name:$siteName | Out-Null }
& $appcmd set apppool /apppool.name:$siteName /managedRuntimeVersion:"" | Out-Null

& $appcmd list site /name:$siteName | Out-Null
if ($LASTEXITCODE -ne 0) {
    & $appcmd add site /name:$siteName /bindings:"http/*:80:demos.feedingfrenzy.ai" /physicalPath:$root | Out-Null
} else {
    & $appcmd set site /site.name:$siteName /[path='/'].[path='/'].physicalPath:$root | Out-Null
    $bindings = (& $appcmd list site $siteName /text:bindings)
    if ($bindings -notmatch 'demos\.feedingfrenzy\.ai') {
        & $appcmd set site /site.name:$siteName /+bindings.[protocol='http',bindingInformation='*:80:demos.feedingfrenzy.ai'] | Out-Null
    }
}

& $appcmd set app "$siteName/" /applicationPool:$siteName | Out-Null
& $appcmd start apppool /apppool.name:$siteName 2>$null | Out-Null
& $appcmd start site /site.name:$siteName 2>$null | Out-Null
```

3. DNS was configured in Route53 with an alias A record:

```json
{
  "Action": "UPSERT",
  "ResourceRecordSet": {
    "Name": "demos.feedingfrenzy.ai.",
    "Type": "A",
    "AliasTarget": {
      "HostedZoneId": "Z1H1FL5HABSF5",
      "DNSName": "ALB-web-2071921150.us-west-2.elb.amazonaws.com",
      "EvaluateTargetHealth": false
    }
  }
}
```

4. ACM validation used a CNAME for `demos.feedingfrenzy.ai`. The prior validation artifact was:

```json
{
  "Action": "UPSERT",
  "ResourceRecordSet": {
    "Name": "_27c77d1559c0c96bfc08c6df5ac823c4.demos.feedingfrenzy.ai.",
    "Type": "CNAME",
    "TTL": 300,
    "ResourceRecords": [
      {
        "Value": "_a3f78310fe83e091332e9332886ddca0.jkddzztszm.acm-validations.aws."
      }
    ]
  }
}
```

Do not recreate DNS/certificate records unless the host is missing or explicitly being reprovisioned.

## Repeatable Demo Publish / Update Steps

This is the normal repeatable process after the demo host exists.

1. Build the generated demo folder locally with this shape:

```text
<package-root>/index.html
<package-root>/<slug>/index.html
<package-root>/<slug>/assets/...
```

2. Zip the package root contents, not the parent folder. The zip root should contain `index.html` and the `<slug>` folder.

3. Upload the zip to a transfer location reachable by the public server. In the Insurance Site workflow, the zip was uploaded to S3 and passed to the server as a presigned URL such as:

```text
https://fp-prod-demo-files.s3.us-east-1.amazonaws.com/website-demos/<zip-name>.zip?<presigned-query>
```

4. Use AWS SSM in `us-west-2` to run a PowerShell command on the public server that downloads, checks, and expands the zip into the existing demo web root. The current known SSM instance id is `i-050e51c92f600cf65`; verify the remote root before deploying.

Command shape used for updates:

```powershell
$ErrorActionPreference = 'Stop'
$root = 'C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot'
$zip = 'C:\Windows\Temp\<zip-name>.zip'
$url = '<presigned-s3-url>'
$slug = '<slug>'

if (Test-Path $zip) { Remove-Item $zip -Force }
Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
$len = (Get-Item $zip).Length
if ($len -lt 100000) { throw "zip download too small: $len" }

Expand-Archive -Path $zip -DestinationPath $root -Force

$demoIndex = Join-Path $root "$slug\index.html"
if (-not (Test-Path $demoIndex)) { throw "Demo index missing: $demoIndex" }

$html = Get-Content -Raw $demoIndex
[pscustomobject]@{
    Host = $env:COMPUTERNAME
    ZipBytes = $len
    Root = $root
    Slug = $slug
    DemoIndex = (Test-Path $demoIndex)
    Title = ([regex]::Match($html, '<title>(.*?)</title>').Groups[1].Value)
    Bytes = (Get-Item $demoIndex).Length
} | ConvertTo-Json -Depth 4
```

5. Validate the public URL:

```text
https://demos.feedingfrenzy.ai/<slug>/
```

For Insurance Associates, validation target was:

```text
https://demos.feedingfrenzy.ai/insurance-associates/
```

For sales packets, validate all key public URLs:

- `https://demos.feedingfrenzy.ai/<slug>/`
- `https://demos.feedingfrenzy.ai/<slug>/demo-homepage.html` when present
- client report PDF
- proposal deck PDF
- annotated improvements image or handoff page
- manifest or README when used by the sales rep

Record HTTP status, content type, and file size/byte count where possible.

6. For customer-facing cleanup, inspect the deployed HTML for expected customer-facing phrases and absence of internal audit/demo language.

Insurance Site validation looked for:

- expected heading: `What can we help you insure?`
- expected footer text: `Insurance Associates helps Central Florida customers compare insurance options`
- absence of visible internal phrases such as `Priority fixes addressed`, `Local SEO cleanup`, `Resource strategy`, `FAQ + schema-ready`, `Designed to feel like a local agency`, `audit task plan`, `meta strategy`, `schema-ready`, and `city-name swaps`.

Adapt those checks to the current demo.

## Safety Rules

- Use `demos.feedingfrenzy.ai` and the physical root `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot` for these generated demos unless the user explicitly changes the demo host.
- Treat `C:\inetpub\wwwroot\ff\demos.feedingfrenzy.ai\wwwroot` as a remote EC2 server path reached through AWS SSM, not as a local destination path.
- Do not copy or expand the demo package into the agent machine's local IIS folders and call that deployed.
- Use AWS SSM region `us-west-2`; current known target instance id is `i-050e51c92f600cf65` on host `EC2AMAZ-HL17G4A`.
- Verify the chosen SSM target has the remote demo root before expanding the zip.
- Do not deploy generated demos into `staging.feedingfrenzy.ai` or the legacy Feeding Frenzy Admin root.
- Do not use `robocopy /MIR` or any destructive mirror operation against the demo root for per-prospect demos.
- `Expand-Archive -Force` into the root is acceptable only when the zip is scoped to `index.html` and the one intended `<slug>` folder, or when intentionally updating known files.
- Keep each prospect scoped to one slug folder.
- Before updating an existing slug, confirm whether it is the same prospect/demo.
- Validate `index.html` exists under the slug after deployment.
- Validate the public URL returns 200.
- Record evidence: source package path, S3 object/presigned URL source, remote root, slug, public URL, status code, title/heading, timestamp.

## Lead-Funnel Integration

For automated lead-funnel demos:

- use a generated slug from the prospect domain or business name,
- package the generated static site under that slug,
- deploy to `https://demos.feedingfrenzy.ai/<slug>/`,
- attach the demo URL to the website-analysis result,
- make the URL available to the constrained Buffaly chat session,
- limit follow-up edits to the same slug,
- expose a CTA after preview: book review, start service, or request implementation.

## Output Format

Return a concise deployment summary:

- Demo URL
- Slug
- Source artifact/folder
- Zip/package name
- Transfer mechanism, for example S3 presigned URL
- Destination physical root
- Validation result, including HTTP status and expected title/heading
- Any warnings/open follow-ups

## Notes

This prompt skill is a workflow guide. Prefer typed deployment, AWS, S3, SSM, and filesystem tools when available. Use generic shell/file-copy operations only after target paths and overwrite safety are clear.

