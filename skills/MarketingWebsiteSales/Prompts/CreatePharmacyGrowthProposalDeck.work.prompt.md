# Create Pharmacy Growth Proposal Deck - Workflow-Based Prompt Skill v3

## Role

You create a pharmacy growth proposal deck by using a real workbench template package.

This is not a deck-generation task.
This is not a visual-design task.
This is not an HTML-authoring task.

Your job is to research the prospect, choose the correct branch, produce a `deck-fill.json`, and hand that fill sheet to the deterministic workbench builder.

The actual deck template must be a set of files on disk: HTML, CSS, assets, slot schema, branch rules, and builder contract. The prompt is not the template.

## Non-Negotiable Rule

Do not create, complete, repair, rewrite, or infer the template from prose.

If the template package is missing or incomplete, stop and report exactly which template files are missing. Do not build the deck manually.

## Required Template Package

The workbench must provide a template package directory before this skill can build a deck.

Required package structure:

```text
pharmacy-growth-proposal-template/
  template-manifest.json
  index.html
  styles.css
  print.css
  slots.json
  branch-rules.json
  static-regions.json
  builder-contract.json
  assets/
    logos/
    fonts/
    remote-care/
    website-branch/
    shared/
```

The package may include additional assets, but it must include the required files above.

## Required Template Files

### `template-manifest.json`

Declares the template identity and file inventory.

Required shape:

```json
{
  "templateId": "pharmacy-growth-proposal-v5",
  "templateVersion": "1.0.0",
  "slideCount": 16,
  "entryHtml": "index.html",
  "stylesheets": ["styles.css", "print.css"],
  "slots": "slots.json",
  "branchRules": "branch-rules.json",
  "staticRegions": "static-regions.json",
  "builderContract": "builder-contract.json",
  "assetsRoot": "assets"
}
```

### `index.html`

Owns the real visual deck structure.

Required properties:

- contains exactly 16 slide sections,
- each slide has a stable slide id or `data-slide` value,
- each editable field is represented by a stable `data-slot` attribute,
- branch-only regions use stable branch attributes such as `data-branch`,
- static regions are identifiable for preservation checks,
- no model-authored HTML is needed to personalize the deck.

The model must not edit this file.

### `styles.css`

Owns screen layout, typography, colors, spacing, slide sizing, and component styling.

The model must not edit this file.

### `print.css`

Owns PDF/page export styling.

The model must not edit this file.

### `assets/`

Owns logos, fonts, static visuals, branch visuals, and shared imagery.

The model may reference approved asset ids in `deck-fill.json`. The model must not invent asset paths.

### `slots.json`

This is the authoritative fill map.

It declares every editable field. If a field is not in `slots.json`, it cannot be filled.

Required shape:

```json
{
  "templateId": "pharmacy-growth-proposal-v5",
  "slides": {
    "01": {
      "changeLevel": "light_fill",
      "slots": {
        "pharmacy_name": {
          "type": "text",
          "required": true,
          "maxChars": 80,
          "dataSlot": "s01.pharmacy_name"
        }
      }
    }
  }
}
```

Each slot should declare:

- slot id,
- slide number,
- field name,
- type,
- required/optional,
- max length or allowed values,
- matching `data-slot` in HTML,
- evidence requirement,
- fallback behavior.

### `branch-rules.json`

Declares legal branches and how the builder applies them.

Required branch values:

- `official_site`
- `no_functioning_site`
- `unconfirmed_site`

Required shape:

```json
{
  "websiteBranches": {
    "official_site": {
      "allowedRegions": ["official_site"],
      "forbiddenTerms": []
    },
    "no_functioning_site": {
      "allowedRegions": ["no_functioning_site"],
      "forbiddenTerms": ["website score", "redesign", "crawl", "site architecture"]
    },
    "unconfirmed_site": {
      "allowedRegions": ["unconfirmed_site"],
      "forbiddenTerms": ["official website", "website score", "redesign"]
    }
  }
}
```

The builder, not the model, uses this file to show/hide branch regions.

### `static-regions.json`

Declares regions that must not change.

Required shape:

```json
{
  "slides": {
    "03": {
      "mode": "static",
      "staticRegionSelectors": ["[data-static-region='s03.body']"],
      "expectedHash": ""
    },
    "04": {
      "mode": "static",
      "staticRegionSelectors": ["[data-static-region='s04.body']"],
      "expectedHash": ""
    }
  }
}
```

The model must treat static slides as immutable.

### `builder-contract.json`

Declares how the workbench builder consumes `deck-fill.json` and produces final artifacts.

Required shape:

```json
{
  "input": {
    "deckFill": "deck-fill.json",
    "branchDecision": "branch-decision.json"
  },
  "output": {
    "html": "dist/index.html",
    "pdf": "dist/pharmacy-growth-proposal.pdf",
    "buildReport": "dist/build-report.json"
  },
  "checks": [
    "templatePackageComplete",
    "slotCoverage",
    "noUnknownSlots",
    "staticRegionsUnchanged",
    "branchRulesApplied",
    "slideCount16",
    "pdfPageCount16",
    "assetsResolve"
  ]
}
```

## If The Package Is Incomplete

Stop immediately if any of these are true:

- no `template-manifest.json`,
- no `index.html`,
- no `styles.css`,
- no `print.css`,
- no `slots.json`,
- no `branch-rules.json`,
- no `static-regions.json`,
- no `builder-contract.json`,
- fewer or more than 16 slide sections,
- slot ids in `slots.json` do not exist in `index.html`,
- static slide/region definitions are missing,
- branch regions are not declared for branch-sensitive slides.

Do not compensate by writing HTML. Report the missing/incomplete package items.

## General Workbench Artifact Flow

Create these model-authored artifacts in order:

1. `run-input.json`
2. `template-package-check.json`
3. `research-notes.md`
4. `lead-profile.json`
5. `branch-decision.json`
6. `deck-fill.json`
7. `build-request.json`

The deterministic builder creates:

8. final HTML
9. final PDF
10. `build-report.json`

## Step 1 - `run-input.json`

Create normalized job input.

```json
{
  "prospectName": "",
  "city": "",
  "state": "",
  "knownWebsite": null,
  "knownNotes": "",
  "templatePackagePath": "",
  "salesRep": {
    "name": "Justin Brochetti",
    "email": "",
    "phone": ""
  },
  "requestedOutput": {
    "html": true,
    "pdf": true,
    "zip": false
  }
}
```

Rules:

- If prospect name is missing, ask for it before continuing.
- If `templatePackagePath` is missing, use the configured default package path from the skill/workbench.
- Do not infer a website as official without evidence.

## Step 2 - `template-package-check.json`

Inspect the template package before research or fill work.

Create:

```json
{
  "templatePackagePath": "",
  "templateId": "",
  "templateVersion": "",
  "complete": true,
  "slideCount": 16,
  "requiredFiles": {
    "template-manifest.json": true,
    "index.html": true,
    "styles.css": true,
    "print.css": true,
    "slots.json": true,
    "branch-rules.json": true,
    "static-regions.json": true,
    "builder-contract.json": true
  },
  "slotCount": 0,
  "missingFiles": [],
  "missingSlotsInHtml": [],
  "warnings": []
}
```

If `complete` is false, stop. Do not produce `deck-fill.json`.

## Step 3 - Minimal Research

Research only fields declared in `slots.json`.

Do not research for its own sake.
Do not perform a broad website audit unless an official-site branch and declared slots need it.
Do not draft slides.

Create `research-notes.md`:

```markdown
# Research Notes

## Prospect Identity

## Website / Public Presence

## Positive Proof

## Digital Gap Evidence

## Competitor / Public Alternative Evidence

## Local Market Inputs

## Unresolved / Unsafe Claims
```

Create `lead-profile.json`:

```json
{
  "prospect": {
    "name": "",
    "city": "",
    "state": "",
    "address": null,
    "phone": null,
    "website": null,
    "candidateWebsite": null,
    "publicProfiles": []
  },
  "evidence": [
    {
      "id": "ev-001",
      "type": "official_website | candidate_website | public_profile | directory | social | storefront | competitor | local_market | crm_note",
      "label": "",
      "url": null,
      "observedFact": "",
      "confidence": "high | medium | low"
    }
  ]
}
```

## Step 4 - `branch-decision.json`

Create a branch decision that matches `branch-rules.json`.

```json
{
  "websiteBranch": "official_site | no_functioning_site | unconfirmed_site",
  "remoteCareFit": "meaningful | limited | unknown",
  "organizationType": "independent_pharmacy | multi_location_operator | authorized_healthcare_or_pharma | unknown",
  "rationale": [
    {
      "decision": "",
      "evidenceIds": []
    }
  ]
}
```

Branch rules:

- Use `official_site` only when ownership/control is sufficiently confirmed.
- Use `no_functioning_site` when no official working website exists or only public profiles are found.
- Use `unconfirmed_site` when a candidate site exists but ownership/control is uncertain.

Modifiers change wording only. They do not change slide count/order/layout.

## Step 5 - `deck-fill.json`

Produce one fill sheet using the exact slots declared in `slots.json`.

The shape of `deck-fill.json` is derived from `slots.json`, not from your memory and not from prose in this prompt.

Rules:

- Include only declared slots.
- Do not invent slot names.
- Do not include static slide content.
- Do not include HTML.
- Do not describe layouts.
- Use short copy that fits each slot's declared length.
- Bind researched claims to evidence ids.
- Use approved fallback copy only when the slot declares a fallback.

Base shape:

```json
{
  "templateId": "pharmacy-growth-proposal-v5",
  "templateVersion": "1.0.0",
  "prospect": {
    "name": "",
    "city": "",
    "state": "",
    "website": null
  },
  "branchDecisionRef": "branch-decision.json",
  "slides": {},
  "evidenceBindings": [
    {
      "fieldPath": "slides.10.proof_caption",
      "evidenceIds": ["ev-001"],
      "claimType": "observed_fact | local_context | calculated_example | caveat | sales_copy"
    }
  ]
}
```

The `slides` object must be generated from `slots.json`.

## Required Slide Semantics

The physical template owns the actual copy/layout. These semantics are here only to help choose safe fill values.

| Slide | Key | Fill Behavior |
|---|---|---|
| 1 | `cover` | prospect identity and opening context only |
| 2 | `two-growth-engines` | light prospect/local context only |
| 3 | `remote-care-explained` | static unless `slots.json` says otherwise |
| 4 | `program-options` | static unless `slots.json` says otherwise |
| 5 | `market-opportunity` | sourced local market fields only |
| 6 | `illustrative-economics` | illustrative gross examples only; no promises |
| 7 | `remote-care-workflow` | static unless `slots.json` says otherwise |
| 8 | `proof-period` | proof-period context only; no invented terms |
| 9 | `two-engine-bridge` | bridge line only |
| 10 | `positive-proof` | branch-appropriate positive proof |
| 11 | `digital-gap` | branch-appropriate action gap |
| 12 | `competitor-evidence` | named observable competitor/public evidence |
| 13 | `find-trust-act-solution` | resolve slide 11/12 evidence with Find/Trust/Act |
| 14 | `combined-recap` | recap only; no new claims |
| 15 | `starting-paths` | caveated starting paths/timing |
| 16 | `decision` | first-path decision and contact only |

## Branch-Sensitive Slides

### Slides 10-13: Official Site Branch

Use this branch only for confirmed official websites.

Allowed slots may reference:

- official site visual,
- current site strengths,
- observable action gaps,
- competitor public actions,
- focused digital-front-door improvements.

Forbidden:

- unsupported score,
- broad redesign claim unless the template/slots allow it and evidence supports it.

### Slides 10-13: No Functioning Site Branch

Use for inactive/broken/no-site/public-profile-only prospects.

Allowed slots may reference:

- public profile,
- storefront,
- directory,
- social profile,
- review presence,
- missing owned digital home,
- patient action gap,
- owned digital front door.

Forbidden:

- website score,
- current-site audit,
- redesign language,
- crawl/architecture findings.

### Slides 10-13: Unconfirmed Site Branch

Use for candidate site with uncertain ownership/control.

Allowed slots may reference:

- candidate site caveat,
- public profile fallback,
- need to confirm controlled website/access.

Forbidden:

- confirmed-site language,
- website score,
- redesign recommendation,
- criticism of the candidate site as if it is theirs.

## Step 6 - `build-request.json`

Create:

```json
{
  "templatePackagePath": "",
  "templateId": "pharmacy-growth-proposal-v5",
  "templateVersion": "1.0.0",
  "deckFillPath": "deck-fill.json",
  "branchDecisionPath": "branch-decision.json",
  "output": {
    "html": true,
    "pdf": true,
    "zip": false
  }
}
```

The builder must reject the request if:

- `template-package-check.json` is incomplete,
- `deck-fill.json` contains unknown slots,
- required slots are empty without approved fallback,
- branch values are invalid,
- HTML has not exactly 16 slides,
- static regions would change,
- PDF export does not create 16 pages.

## Hard Rules

- The prompt is not the visual template.
- The model must not create the template.
- The model must not complete a partial template.
- The model must not write final HTML.
- The model must not write CSS.
- The model must not create layouts.
- The model must not add/remove/reorder slides.
- The model must not fill fields that are not declared in `slots.json`.
- The model must not change static regions.
- The model must not generate a PDF except through the deterministic builder.

## Final Response

Report:

- selected branch,
- template package path,
- template package check result,
- fill sheet path,
- build request path,
- final output path if the builder ran,
- any missing package files or blocked fields.

Do not paste the deck.
Do not describe new layout ideas.
Do not claim completion if the physical template package was missing or incomplete.
