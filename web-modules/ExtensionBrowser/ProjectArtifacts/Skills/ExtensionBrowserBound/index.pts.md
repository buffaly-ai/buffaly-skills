# ExtensionBrowserBound/index.pts history

Companion history for `ExtensionBrowser.WebModule/ProjectArtifacts/Skills/ExtensionBrowserBound/index.pts`. This file was created on 2026-11-16. Earlier changes to the module are recorded only in git history, including 854a460 (browser-aware context for Chrome conversations), ab18e8c (prompt projected into the runtime context path), a516fa2 (bound session action root) and 92231b1/43a487c (instance routing). The `index.pts.lazy.json` sidecar was added in 96fbe8b.

## Context phrase moved to the SemanticContext annotation (2026-11-16)

**What changed**

- `ExtensionBrowserBoundSession : ContextPrompt` now declares its activation phrase with a bare `[SemanticContext("when a Chrome conversation has a default ExtensionBrowser instance and current browser context")]` annotation directly above the prototype.
- The retired `ContextPhrase = "...";` assignment is removed. The phrase text is unchanged, as are `EntityName`, `PromptPath`, `ActionRoot`, `DefinitionPromptPath` and the other 11 prototypes.
- `index.pts.lazy.json` is unchanged. It maps only the module path and the same 12 prototype names.

**Why**

- Core N1 (buffaly-development 6153e366d9a8087dc247f915b4504d586940137d) makes the annotation the single phrase representation. The core source reader `ContextPromptSyntax` rejects a `ContextPhrase =` assignment with ContextPhraseAssignmentRetired and excludes that context. This exclusion was observed for this context in a staging worker log on 2026-11-16.
- Under the same contract, `[SemanticContext("")]` is a retraction, and a context without the annotation is a legacy context that loads only explicitly.

**Compatibility**

- Requires a core whose shipped `Annotations.pts` declares the no-op `SemanticContext(Prototype prototype, string phrase)`. Against a core without that declaration, this file fails to compile with "Unknown function: SemanticContext".
- Ship this package only together with the N1 core. Do not install it into an older core, and do not install the N1 core with the previous package.

**Validation performed (2026-11-16)**

- An isolated real-compiler harness (temporary, outside every repository) used the exact core N1 test binaries: ProtoScriptAuthoring DB480DD239CC, ProtoScript.Runtime 63633422296E, ProtoScript 4924C63885FA and ProtoScript.Parsers FA276370B04C. All 40 checks passed.
  - Reader: `ContextPromptSyntax.ReadUnit` returns one declared and one active row with the exact phrase and the single `PromptPath`.
  - Compiler: `ProtoScriptRuntime.CreateForProject` loads all 12 prototypes. The only startup diagnostic is the expected `ExtensionBrowserInstallationService` AutoInitialize=false skip, and `ExtensionBrowser.WebModule.dll` resolves through the temporary `lib/web-modules` probe root.
  - Negative control: without only the shipped SemanticContext declaration, compilation fails with "Unknown function: SemanticContext".
  - Writer: the shipped `InsertOrUpdatePrototypeDefinitionAtomically` with `ContextPromptSyntax.CreateRetraction` rewrites only this prototype, to `[SemanticContext("")]` with the same `PromptPath`. Every other character is unchanged, with CRLF kept and no BOM. The reader reports the context as retracted with no active rows, and the retracted file compiles cleanly.
- `ExtensionBrowser.WebModule` and its contract-test executable built with 0 errors (the 3 existing CS8603 nullable warnings remain), and the executable reported "ExtensionBrowser WebModule contract tests passed."
- `npm ci` and `npm run release:check` passed in `extension/source`: TypeScript, 18 argument-contract checks, page-context tests, the old-guard baseline, 29 + 56 real Chrome DOM checks, build, ZIP, release verification for 0.2.65, and a production audit with 0 vulnerabilities. `npm ci` reported 16 findings in the full development dependency tree. Dependencies are unchanged.

**Limitations**

- Not yet validated by installing through the Buffaly package lifecycle and compiling the target project (AGENTS.md). Package build, publication, installation and staging activation are a separate release step that must ship with the N1 core.
- No live context activation, Recall preflight or browser session was exercised.
