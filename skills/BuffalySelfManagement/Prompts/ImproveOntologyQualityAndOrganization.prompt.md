# Improve Ontology Quality And Organization

Goal
- Improve ontology quality in ProtoScript while preserving behavior.
- Ensure prototypes are organized under appropriate parents and in appropriate files.
- Remove redundant inheritance entries and keep intentional multiple inheritance where non-redundant.

Primary Principles
1. Choose the narrowest correct parent(s) for each prototype.
2. Use multiple inheritance only when each parent contributes distinct, non-redundant semantics.
3. Remove redundant transitive parents (for example `BaseObject` when already inherited through another parent).
4. Keep instances (`partial prototype Name#Instance`) near their domain model and in the correct skill file.
5. Prefer minimal coherent edits over broad refactors.

Workflow
1. Identify target ontology area and files.
2. Classify each prototype:
   - base/type concept,
   - action/tool concept,
   - concrete instance (`#`).
3. Validate inheritance quality:
   - confirm required parent(s),
   - keep valid non-redundant multiple parents,
   - remove transitive redundant parents.
4. Normalize redundant parents using the typed cleanup action:
   - `ToRemoveRedundantPrototypeParentsInFile(fileName, includePartials)`
5. Validate instance placement:
   - move/update instances to the most semantically appropriate existing file,
   - keep sibling instances grouped with related parent/type definitions when practical.
6. Validate discoverability:
   - ensure relevant prototypes include semantic entities and meaningful names.
7. Compile and verify no behavior regressions.

Required Checks
- Inheritance declarations are non-redundant.
- Multiple inheritance is intentional and non-duplicative.
- Instances are located in the correct domain file/skill.
- No unrelated prototypes changed.
- Parse/compile pass after edits.

Deliverable Format
1. Scope and files reviewed.
2. Inheritance fixes applied.
3. File organization/placement fixes applied.
4. Tool runs executed (including redundant-parent cleanup calls).
5. Validation result.

Guardrails
- Do not collapse valid non-redundant multiple inheritance.
- Do not move prototypes across domains unless semantic fit is clearly improved.
- Do not do broad hierarchy redesign unless explicitly requested.
- Keep edits reversible and minimal.
