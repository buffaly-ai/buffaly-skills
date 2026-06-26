# How to Create an Automaton

Use this prompt skill when the user asks to create, design, run, or explain an **Automaton**: a recurring, stateful, evidence-driven agent loop that manages a backlog, delegates bounded work to one or more workers, sleeps or waits for events, verifies real-world evidence, updates durable state, and repeats until stopped or complete.

An Automaton is not just an agent with a timer. It is an evidence-driven state machine wrapped around one or more agents.

## Core definition

An Automaton is a specialized agent pattern for long-running, repeatable work where progress can be broken into verifiable units.

It should have:

- a durable objective;
- a durable backlog or state file;
- a shared workspace or target system;
- a worker/child session or execution path;
- a wake interval or event trigger;
- evidence-based inspection;
- drift reconciliation;
- stop/resume behavior;
- a clear completion policy.

The Automaton parent usually orchestrates. It should not do all work itself unless the worker path is truly blocked.

## General algorithm

```text
initialize automaton:
    load durable task/backlog
    load operating instructions
    verify shared input/output locations
    verify worker/child session exists or define execution path
    verify communication channel works
    verify evidence-checking method works

loop until stopped:
    read durable tracker
    inspect current world state
    reconcile tracker with evidence

    if an active assignment exists:
        check whether output exists
        check whether validation passed
        check whether it was committed/published/marked done
        if done:
            update tracker as done
            clear active assignment
        else if in progress and within allowed wait:
            sleep again or send one status nudge
            continue
        else if stalled:
            split task, clarify instructions, or mark blocked
            continue

    choose next eligible work item:
        prefer highest-priority gap
        avoid duplicate work
        avoid starting work that depends on an unfinished item
        choose one bounded unit, not a large vague batch

    create worker instruction:
        include absolute paths / concrete target IDs
        include source-of-truth references
        include expected output
        include validation requirements
        include commit/publish/completion-report requirements
        include what not to touch

    queue message to worker without waiting, or execute one bounded unit directly if no worker is appropriate
    record assignment in tracker/scratch:
        timestamp
        queue id or execution id
        target
        expected output
        validation method

    sleep scheduled interval or wait for trigger

finalize or pause:
    report current tracker status
    list completed work
    list active/pending/blocked items
```

## State machine

```text
Idle
  -> LoadState
  -> VerifyEnvironment
  -> ReconcileState
  -> SelectWork
  -> DispatchWork
  -> Sleep
  -> Inspect
      -> Done? UpdateState -> SelectWork
      -> InProgress? Sleep
      -> Stalled? Nudge -> Sleep
      -> StillStalled? SplitOrBlock -> SelectWork
      -> Error? Diagnose -> RetryOrBlock
  -> StopRequested? Pause
  -> AllDone? Complete
```

## What worked in the Buffaly documentation loop

### 1. Durable tracker instead of context memory

The loop worked only after durable state was introduced. The tracker stored:

- the overall goal;
- publication roots;
- article backlog;
- status for each item;
- target paths;
- commit hashes;
- notes and next actions;
- loop rules.

For a new Automaton, create a durable control artifact early. Do not rely on conversation memory.

Possible durable stores:

- markdown task tracker;
- JSON state file;
- SQL table;
- issue tracker;
- project board;
- deployment manifest;
- test result table.

### 2. One work item per loop iteration

The loop worked best when each iteration dispatched exactly one bounded task.

Good:

```text
Create how-to/add-a-new-prompt-skill.md
```

Bad:

```text
Improve all provider docs and all settings docs and find missing concepts.
```

Every work item should have:

- one target;
- one expected output;
- one validation path;
- one completion status.

### 3. Absolute shared paths or canonical IDs

A major failure mode was relative-path drift: child workers wrote relative to their own session directory while the parent inspected a different relative directory.

Fix this by using absolute paths or canonical IDs.

Examples:

- absolute filesystem path;
- canonical database ID;
- issue ID;
- queue message ID;
- cloud resource ARN;
- deployment environment name;
- document ID;
- git branch and commit hash.

Never assume the worker's relative context is the same as the parent's.

### 4. Inspect evidence, not claims alone

The parent should verify completion using primary evidence, not only a worker's final message.

Documentation evidence:

- target file exists;
- title/content exists;
- git status is clean;
- commit exists;
- commit touched expected files.

Code evidence:

- compile passes;
- tests pass;
- diff touches expected files only;
- commit exists.

Deployment evidence:

- version endpoint matches;
- health checks pass;
- logs are clean;
- monitoring is healthy.

Data evidence:

- output rows exist;
- counts match;
- validation query passes;
- audit row inserted.

### 5. Commit or publish after each completed unit

Define the durable completion boundary for the domain.

Examples:

- git commit for docs/code;
- transaction commit for data;
- ticket state transition for issue workflows;
- release record for deployment;
- published artifact for content workflows.

Do not mark a unit done until durable completion evidence exists.

### 6. Nudge once, then change approach

Avoid infinite repeated nudges.

Recommended policy:

```text
if no progress after first wait:
    send one focused nudge

if no progress after second wait:
    inspect whether target/path/instructions were wrong
    split the task smaller
    correct path/context
    or mark blocked and move to safe next item
```

### 7. Reconcile tracker and world state

If the tracker expects one path but the worker creates another, prefer direct evidence, then update the tracker.

Reconciliation loop:

```text
read tracker
read real-world state
if they disagree:
    inspect evidence
    update tracker
    record correction
```

### 8. Stop and resume cleanly

When the user says stop:

- stop queueing new work;
- record last completed item;
- record any active queued item;
- report where to resume;
- do not continue sleeping/dispatching.

A good stop record includes:

- current phase;
- last completed item;
- active queued item;
- next planned item;
- known blockers;
- current output root;
- last verification time.

### 9. Verify environment before acting

Before each run or after interruptions, verify:

- root exists;
- target directory exists;
- expected files are present;
- recent history matches expected work;
- git/database/service state is safe;
- worker channel is available;
- credentials/secrets are available if needed.

If the root changes, update durable guidance immediately.

### 10. Parent orchestrates; worker executes

Parent responsibilities:

- maintain backlog;
- choose next item;
- write detailed instructions;
- inspect output;
- update tracker;
- decide next action;
- pause/resume safely.

Worker responsibilities:

- perform assigned work;
- validate;
- commit/publish;
- report exact result.

## Recommended durable tracker structure

```markdown
# <Automaton Name>

## Goal
What this Automaton is trying to accomplish.

## Scope
What it may and may not touch.

## Shared Roots / Target Systems
- Source root:
- Output root:
- Database:
- Service:
- Queue:
- Child session:

## Source of Truth
Where facts must come from.

## Loop Rule
1. Read tracker.
2. Inspect world state.
3. Choose one item.
4. Queue child assignment or execute one bounded unit.
5. Sleep or wait for trigger.
6. Inspect evidence.
7. Update tracker.
8. Repeat until stopped.

## Status Legend
- gap
- queued
- in-progress
- done
- partial
- blocked
- needs-review

## Backlog
| ID | Item | Target | Status | Assigned Queue ID | Evidence | Notes |
|---|---|---|---|---|---|---|

## Active Assignment
- ID:
- Queue item:
- Target:
- Assigned at:
- Expected evidence:
- Next check:

## Progress Log
Append-only log of decisions and evidence.

## Blockers
Real blockers only, with evidence.

## Stop/Resume Notes
Where to resume.
```

## Worker assignment template

```text
You are the worker for an Automaton-managed task.

Repository/root/system:
<absolute root or canonical target>

Task ID:
<id>

Task:
<one concrete task>

Target:
<absolute file path / database ID / service / ticket>

Audience / intent:
<who this is for and what success means>

Source of truth:
<files, logs, APIs, docs, code, database tables, tickets>

Requirements:
1. Do only this task.
2. Use source evidence.
3. Do not touch unrelated files/resources.
4. Validate the result.
5. Commit/publish/mark complete if applicable.
6. Report exact result.

Expected completion evidence:
- File exists:
- Tests pass:
- Commit hash:
- Status changed:
- Output artifact:

Completion report format:
Status: done|blocked
Target:
Evidence:
Commit/Artifact:
Summary:
Open Questions:
```

## Example Automaton configurations

### Documentation Automaton

```yaml
name: Documentation Automaton
goal: Build and improve user documentation
worker: document writer
wake_interval: 5 minutes
state_file: C:\path\to\documentation-tracker.md
workspace_root: C:\repo
output_root: C:\repo\docs-or-wiki
source_of_truth:
  - source code
  - checked-in docs
  - existing wiki
completion_evidence:
  - target file exists
  - git commit exists
  - git status clean for docs/wiki
stalled_policy:
  first_miss: nudge same assignment
  second_miss: split task or correct path
  third_miss: mark blocked and continue if safe
stop_policy:
  stop immediately after current inspection step
```

### Code Repair Automaton

```yaml
name: Test Repair Automaton
goal: Reduce failing tests one at a time
worker: code fixer
wake_interval: 10 minutes
state_file: task-test-repair.md
workspace_root: C:\repo\Product
backlog_source: failing test list
completion_evidence:
  - specific test passes
  - affected test suite passes
  - commit exists
stalled_policy:
  - nudge once
  - ask worker for blocker
  - split by failing test
```

### Data Hygiene Automaton

```yaml
name: Data Hygiene Automaton
goal: Clean invalid customer records
worker: data repair worker
wake_interval: 15 minutes
state_file: data-cleanup-tracker.md
backlog_source: validation query
completion_evidence:
  - record count decreases
  - validation query passes
  - audit row inserted
stalled_policy:
  - classify invalid record
  - escalate uncertain records
```

### Deployment Verification Automaton

```yaml
name: Deployment Verification Automaton
goal: Verify deployment health after release
worker: ops verifier
wake_interval: 5 minutes
state_file: deployment-verification.md
completion_evidence:
  - version endpoint matches
  - health check passes
  - smoke tests pass
  - logs show no critical errors
stalled_policy:
  - recheck once
  - gather logs
  - escalate rollback recommendation
```

## Anti-patterns

Do not:

- loop without a durable tracker;
- assign broad vague tasks;
- trust relative paths;
- queue new work while previous work may still be active;
- repeat identical nudges indefinitely;
- mark done from worker claims alone;
- let tracker state drift from real-world state;
- continue after a stop request;
- hide blockers;
- confuse missing tools with impossible tasks.

## How to respond when this skill is invoked

When the user asks to create an Automaton:

1. Ask no broad questions if the goal can be inferred.
2. Identify the domain and durable output/evidence systems.
3. Propose a tracker/state structure.
4. Define the loop interval or trigger.
5. Define worker roles.
6. Define one-unit-at-a-time task selection.
7. Define verification evidence.
8. Define nudge/split/block policy.
9. Define stop/resume behavior.
10. If the user wants implementation, create the tracker and start the first loop only after confirming the active root/target system.
