# Diagnostic research and completion contract

Applies to every local-log and remote-alarm diagnosis, including existing working sessions and prior researchers. This is the shared completion owner; saved guidance supplies application-specific retrieval details, not a weaker stopping rule. Preserve the assigned incident, dispatch tree, session settings, research authority and source evidence. Do not create more investigators.

## Investigate before reporting

1. Match the exact occurrence: application/environment, failed operation, complete error/inner exception, time/timezone and request/correlation identifiers. Distinguish collector location from failure location and observed impact from possible impact.
2. Retrieve the underlying logs whenever they can affect cause, impact, deployment or recovery. Researchers may connect through the appropriate existing authorized APIs to pull logs; remote access is not inherently unavailable. Resolve the affected machine/site and trusted API/root/credential registration. Use the existing diagnostics skill/client and approved secure transport, not guessed hosts, plaintext secrets or internal HTTP calls from host code. Local file tools are appropriate for genuinely local logs.
3. For remote RooTrax/Creator applications, use `ToInspectSharedCreatorDiagnosticsSkill` and the target's registered diagnostics binding. Inventory with diagnostics/log-files; retrieve relevant error/debug records with diagnostics/log-read and raw diagnostics/log-download when the bounded parsed tail cannot cover the incident. Correlate error and debug records for the incident, not merely the latest tail. Preserve operation, target, request receipt, capture time, coverage and truncation. Other applications use their own approved log API. An email excerpt, inventory-only request, empty tail, truncated list, missing action alias or stale tool binding is NOT completed log research.
4. If a listing is capped, inspect the owning API's supported paging/filter/download capabilities, path validation and applicable registration. Inventory omission alone is not an access denial. An exact basename identified by the original monitor, retained evidence or the authoritative logger/path producer is not a guessed filename. When the existing API authorizes a registered-root read/download of that basename without inventory membership, use it within existing authority. A convention alone is not an observed filename: verify the producer before deriving a correlation log name. Preserve filename provenance and retrieval receipts. Do not broaden roots, guess prohibited paths, retry denied routes, substitute credentials or bypass access controls. A failed route does not prove every route unavailable. If a coordinator-imposed limit blocks existing user authority, return that concrete dependency to the coordinator for reconciliation; do not turn an agent's handoff wording into a new user approval gate.
5. Trace the failed code, callers/producers, configuration and relevant runtime/deployment state. Read bounded introducing/subsequent diffs, companion history and tests. Explain the condition that failed, what activated it when knowable, and the earlier behavior that must remain correct. A source path in a stack is not proof of the loaded binary; logging a failure is not its underlying cause.
6. List plausible explanations and the actual checks/results that support or rule them out. Follow useful safe authorized checks until they are resolved or a directly validated external constraint prevents them. Do independent work even when one branch is blocked. Current success from another environment does not establish historical recovery.

## Completion record

Write the complete investigation and a structured record in findings.json according to ErrorDiagnosticReport/CONTRACT.md. Every check cites existing evidence files and a specific locator. Retained earlier research may be reused when relevant, with its date/scope/limitations; do not rerun incidents just to produce new evidence. Read the referenced results before claiming completion.

Required check areas: Incident, Logs, CodeAndCallers, ConfigurationAndRuntime, HistoryAndProtectedBehavior, AlternativesAndAuthority. A check is Completed with actual result/evidence; NotApplicable requires a concrete reason/evidence; Blocked references a verified blocker. Generic 'checked', 'unavailable' or 'research exhausted' is not a result.

Each plausible cause records Supported, RuledOut or Unresolved, the discriminating result and evidence. Each unresolved cause must be tied to a verified blocker. All remaining safe authorized checks must be performed before a final response: a nonempty RemainingWork array means keep researching, not hand it to Matt as 'Next diagnostics'.

A blocker records the exact missing fact, target/operation, actual constraint result, evidence, checked alternatives, original governing authority/access boundary and responsible owner. Confirm the evidence is actually unavailable to this agent, rather than merely absent from one response. Do not invent a request for new capture, instrumentation, permissions or deployment to fill a template. Ask for external help only when truly necessary, naming the smallest concrete dependency and its purpose. An unspecified 'network owner' is not an executable handoff; resolve the existing owner when tools permit it.

## Terminal outcomes

- FixIdentified: evidence supports the recommended change and a concrete verification plan, but do not imply implemented or recovered.
- FixVerified: the authorized change was made and the original failing case, protected behavior and applicable runtime path were actually verified. A build or source ancestry is insufficient.
- NoChangeNeeded: evidence establishes the expected behavior and observed impact; unexplained errors or absence of recurrence do not qualify.
- Blocked: useful authorized research is exhausted under directly validated external constraints. Explain the actual dependency, not a research checklist.
- Researching: not terminal. Continue work and use commentary, not a final report.

A logging-only change can be a supported action without being a repair of lost connectivity. Classify RecommendationScope as FailureRepair, AlarmOnly, NoChange or ExternalDependency and make its effect explicit. Never turn 'cause unknown' into completion by itself, or claim no fix is available before checking the research record.

The renderer validates required evidence links, dispositions and contradictions. It does not prove evidence truth or exhaustive reasoning, and it is not a host-wide response interceptor. Agent adoption remains guidance-based. Runtime UI fixtures, local tests and a fresh collector-to-researcher diagnosis are separate acceptance levels.

## Reporting and authority

Use the report renderer only after the completion record passes. Research depth stays in the full linked investigation; the visible result is a short self-contained decision, understandable without any earlier conversation. Follow the report contract's reader test. Preserve native clickable actions after, not inside, the HTML document.

Read-only diagnostics and evidence artifacts do not authorize application fixes, source/configuration/data writes, service restart, deployment, business replay, new capture, access expansion or delegation. Carry existing authority accurately; recommendations do not grant it. Return one consolidated result to the established coordinator only when that handoff is authorized. Do not confuse admission with incident resolution.
