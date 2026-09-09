# verified.js

Exact `?run=<id>` deep links take precedence over saved local selection. Missing linked IDs fail explicitly instead of substituting another run. Selecting a run updates the URL using history.replaceState; the URL is presentation state only and cannot execute a workflow.

Static UI controller for `/verified/index.html`.

Attempt views show bounded correction rounds and concrete failed checks first, with complete raw ResultData behind an expandable evidence disclosure. Declared outputs render their canonical relativePath rather than stringifying objects. Per-attempt actual model is displayed only from the server's verified projection; no client inference from requested selection.

## Scope

- Owns only the new verified static route under `GeneralSkillWorkbench.Web/wwwroot/verified/`.
- Uses vanilla browser APIs; no framework, sidebar component, or existing workbench UI dependency.
- Calls the planned `/api/verified/*` endpoints directly from the page.

## Contracts

- Definitions: `GET /api/verified/definitions`
- Models: `GET /api/verified/models`
- Runs: `GET /api/verified/runs`, `POST /api/verified/runs`
- Run detail/control: `GET /api/verified/runs/{id}`, `POST /start`, `POST /cancel`, `POST /steps/{stepId}/retry`
- Artifacts: `GET /api/verified/runs/{id}/files/{relativePath}`

Run DTO mapping is intentionally isolated in one `mapRun` function. The rest of the UI consumes the mapped shape and does not include broad casing fallbacks.

### Exact API status contract

- Run: `created`, `running`, `cancelrequested`, `canceled`, `passed`, `failed`, `interrupted`.
- Step: `pending`, `ready`, `running`, `passed`, `failed`, `blocked`, `invalidated`, `canceled`, `interrupted`.
- `mapRun` rejects missing, unknown, padded, or differently cased statuses with an API contract error. No normalization or inferred execution status.
- `created` enables Start and does not poll. Only `running` and `cancelrequested` poll; terminal statuses stop polling. Cancel is enabled only for `running`.
- Retry requires an eligible step (`failed`, `blocked`, `interrupted`, `passed`), explicit `steps[].rerunAllowed: true`, no running step, and no `running`/`cancelrequested` run. Omitted permission keeps retry disabled; the parent API must project this boolean when rerun is explicitly allowed. The click handler rechecks the same gate.

### Model catalog contract

- Choices: `{provider, transport, modelName, reasoningLevels}`.
- Submitted/reported model: `{provider, transport, modelName, reasoningLevel}`.
- Run `model` is the frozen requested tuple. Separate nullable `actualModel` is populated by the parent only from validated lifecycle usage; the UI never substitutes the requested tuple for actual execution.
- Transport is always visible and explicitly selected, including for single-transport providers, to avoid inference. Model choices are filtered by provider plus transport.
- Changing provider clears transport/model/reasoning; changing transport clears model/reasoning. Only previously selected values that still exist in the catalog are restored.
- Submission verifies the full selected tuple against the current catalog. Requested and reported identities both include transport.

## Behavior

- Requires explicit provider/transport/model selection and explicit reasoning selection when supported. An empty `reasoningLevels` array displays disabled `Not supported` and submits `reasoningLevel: ""`; no reasoning default is invented.
- The Run button creates a run and explicitly starts it; there are no fake defaults or automatic starts on page load.
- Polling runs only for `running`/`cancelrequested` and stops when hidden or terminal. Transient polling failures display an error and reschedule while still active.
- JSON inputs are editable and validated as an object before submission.
- The existing accessible inputs help displays the selected definition's optional `inputDescription` via textContent; switching to a definition without it restores generic help. Pharmacy scope therefore remains visible without implying that unsupported JSON changes select a different prospect. Server validation remains authoritative.
- Text is inserted with `textContent`/DOM nodes rather than HTML string injection.
- Selected definition, selected run, selected step, selected tab, and selected model controls are preserved in `localStorage` across refreshes.
- Tabs support keyboard arrow/Home/End navigation and visible focus states.

## Static review corrections and integration assumptions

- All endpoints remain same-origin `/api/verified`. GET definitions/models/runs return bare arrays, not envelopes. Each list run and detail run must include nonempty string `id`, `workflowId`, exact status, `steps` array, and `events` array. The single `mapRun` boundary handles run shapes.
- POST create returns the full run DTO with `status: created`. Only the explicit Run click creates then starts. Start/cancel/retry may return an empty success response; the subsequent GET detail is authoritative. Start/retry must persist an observable running or terminal state before that GET, since `created` intentionally never polls.
- Parent owns model catalog validation. UI verifies selected tuple membership and supported reasoning choice at submission. Empty reasoning arrays are supported, not errors; switching to such a model clears stale reasoning storage.
- Three separate identity displays: current new-run form, selected run frozen request (`model`), selected run actual execution (`actualModel`). Changing the form never changes the latter two. Both run tuples are rendered independently of the current catalog, preserving historical identity.
- `actualModel: null` displays `Actual model not reported yet`, except a nonempty run whose every projected step has exact `kind: "operation"` or `kind: "review"` displays `No model execution required`. These are deterministic non-agent engine kinds, including sales-summary's review stage. Absent/unknown kinds are not evidence. Non-null actualModel always displays the validated tuple without falling back to model.

## Compact run-first layout

- Reduced header and default JSON editor height (84px, user-resizable). All existing IDs/capture selectors remain intact.
- Native `#setupDisclosure` details is open initially and collapses on selecting a different run. User reopening is preserved through same-run polling; focus inside collapsed setup moves to its keyboard-accessible summary. Run remains inside expanded setup to prevent accidental reruns of hidden inputs.
- API errors remain outside the collapsed setup. Frozen/actual identity and timing remain in the progress card. Step summary shows latest attempt resultData, error and timing; resultData is copied only at mapRun and inserted as text.
- Below-one-second durations display integer milliseconds; seconds below one minute retain two decimal places. No observed 0.2-second execution is rounded to 0 seconds.
- Compact desktop spacing targets progress and selected result above the fold at 1440x1000, with responsive single-column styles retained. Fresh rendered validation is required before claiming exact viewport geometry.
- Mutating requests are serialized and older detail reads are invalidated. Out-of-order run selection responses cannot replace the current selection. A failed start preserves the created run and restores Start. Server remains responsible for authorization, transition validation, and idempotency across tabs/clients.
- Polling is based only on known `running`/`cancelrequested` states; no synthetic progress. Definition-only previews display `Not run`. Terminal runs missing completion timestamps display missing timing instead of a growing elapsed value.
- Rebuilt run/step controls have stable IDs for in-page focus restoration; tabs use roving tabindex. Local selection persistence is not proof of fresh model selection or runtime identity.
- No browser, live API, deployment, or commit is part of this static review. Model attribution for this review is not independently verified by these files or tests; no claim is made that prior work ran under Astra.
