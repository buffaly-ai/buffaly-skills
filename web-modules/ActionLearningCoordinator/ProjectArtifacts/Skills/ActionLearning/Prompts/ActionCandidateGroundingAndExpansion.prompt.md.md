# Action Candidate Grounding and Expansion Prompt

Version 2.0.0 implements the dedicated Action Learning child procedure. It uses exact persisted `ToSearchCandidateActions` calls as observed triggers, resolves their historical normalized fragments without mutation, and accepts semantic neighbors only when they map back to canonical stored action-search calls.

The prompt requires one fixed 16-section `artifacts/action-learning/new-tool-artifact.md`, typed fixed-path write/read-back, explicit checkpoint/completion markers, contamination quarantine, current-owner inspection, evidence-derived public phrases, provisional implementation form/contracts, and honest no-build/needs-more-evidence outcomes.
