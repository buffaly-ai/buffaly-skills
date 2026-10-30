# csharp-viewer.js history

## 2026-10-30 — Project workspace and reliable exit controls
Implemented the approved project-picker, scoped API consumption, navigation tabs/history, search result reveal, generation guards, find/line/wrap/copy and focus/full-screen controls. Preserved safe syntax highlighting and session artifact links. Actual staging testing found browser-protocol Escape did not reliably exit real full screen; added explicit Escape exit through the Fullscreen API, preserving modal priority and focus restoration. Fixed project labels on refreshed deep links to retain project-relative context. Validation: source real Chromium8groups passed including1440/1024/768/390layouts, delayed query/file responses, full-screen actual entry, explicit exit and Escape; .NET28tests passed before this frontend-only correction. Final installed staging regression is recorded in delivery evidence.


## 2026-10-30 — Local GitHub repository opening
Repository-first project picker discovers existing github.com checkouts using only bounded local metadata under configured roots; retains folder/subproject opening. No Git process, network, credential file or config include reads. Source validation: 46 .NET tests, 6 repository UI checks and 8 workspace regression groups passed. Staging results are recorded separately after installation.

## 2026-10-30 — General repository source browsing
Expanded tree/file reads from C# only to regular files and empty folders. Strict bounded UTF-8/BOM-Unicode decoding rejects binary/control/invalid text rather than silently corrupting source. Preserved read-only scope/link/2MB protections and excluded-folder checks; tree errors explicitly at10,000entries/16levels. C# remains highlighted with Roslyn symbols; other text is escaped literal plain text with file-type labels and disabled C# navigation. Session text links supported without changing existing C# provider registration. Validation:68.NETtests,6mixed-file source UI checks and8workspace regression groups passed; installed staging proof follows separately.
