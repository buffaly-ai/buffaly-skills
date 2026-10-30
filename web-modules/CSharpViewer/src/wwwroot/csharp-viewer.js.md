# csharp-viewer.js history

## 2026-10-30 — Project workspace and reliable exit controls
Implemented the approved project-picker, scoped API consumption, navigation tabs/history, search result reveal, generation guards, find/line/wrap/copy and focus/full-screen controls. Preserved safe syntax highlighting and session artifact links. Actual staging testing found browser-protocol Escape did not reliably exit real full screen; added explicit Escape exit through the Fullscreen API, preserving modal priority and focus restoration. Fixed project labels on refreshed deep links to retain project-relative context. Validation: source real Chromium8groups passed including1440/1024/768/390layouts, delayed query/file responses, full-screen actual entry, explicit exit and Escape; .NET28tests passed before this frontend-only correction. Final installed staging regression is recorded in delivery evidence.


## 2026-10-30 — Local GitHub repository opening
Repository-first project picker discovers existing github.com checkouts using only bounded local metadata under configured roots; retains folder/subproject opening. No Git process, network, credential file or config include reads. Source validation: 46 .NET tests, 6 repository UI checks and 8 workspace regression groups passed. Staging results are recorded separately after installation.

## 2026-10-30 — General repository source browsing
Expanded tree/file reads from C# only to regular files and empty folders. Strict bounded UTF-8/BOM-Unicode decoding rejects binary/control/invalid text rather than silently corrupting source. Preserved read-only scope/link/2MB protections and excluded-folder checks; tree errors explicitly at10,000entries/16levels. C# remains highlighted with Roslyn symbols; other text is escaped literal plain text with file-type labels and disabled C# navigation. Session text links supported without changing existing C# provider registration. Validation:68.NETtests,6mixed-file source UI checks and8workspace regression groups passed; installed staging proof follows separately.

## 2026-10-30 — Real API error contract correction
Staging binary rejection returned the existing ASP.NET camelCase errorMessage contract; client and mock fixtures incorrectly expected PascalCase. Corrected client and fixtures to the single actual contract so binary/size/denial errors remain explicit; test-only root-relative fixture path corrected too. Validation below is recorded after rerunning source suites; prior deployed0.1.10binary message test failed honestly before this fix.

Validation of error-contract correction:6mixed source UI groups and6repository source UI groups passed; errors now use actual camelCase fixtures. Final staging checks follow the new package.

## 2026-10-30 — Preserve the visible left edge on long source lines
Visual staging proof of Office365 Markdown reproduced code-wrap scrollLeft49 after jumpTo scrollIntoView hid leading characters. jumpTo now explicitly aligns inline start and resets code-pane horizontal scroll to zero. Added long-line mixed-text reload assertion. Repository regression now deliberately selects a .cs file rather than assuming the first mixed file must have C# highlighting. Validation: source mixed suite and workspace suite rerun below; final staging proof requires the new payload.

Validation after long-line fix: source mixed6groups, workspace8groups and repository6groups passed; installed proof follows final package. No remaining source/test failure.
