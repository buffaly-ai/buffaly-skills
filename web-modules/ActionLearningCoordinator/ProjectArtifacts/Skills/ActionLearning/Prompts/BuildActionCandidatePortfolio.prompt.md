# Build an Action Learning Candidate Portfolio

Read the coordinator-supplied packet with `ToReadActionLearningPortfolioInput`. Build a reviewable portfolio only from its evaluated New Tool Artifacts. Never count a row merely because an artifact exists.

For every input, preserve its artifact path, evaluation result, evidence disposition, owner classification, provisional implementation form, expected savings, and confidence. Then:

1. Exclude invalid-schema, invalid-evidence, and contaminated artifacts.
2. Put `no_build`, healthy-owner, negative-control, and evidence-limited items in a calibration appendix.
3. Merge artifacts only when they describe the same stable subgoal, trigger family, owner boundary, and acceptance obligations. Preserve all source references on the merged row.
4. Keep owner-extension candidates separate from genuinely new actions.
5. Rank substantive candidates by independently reported reusability, discoverability, bounded savings, risk reduction, implementation usefulness, owner clarity, and implementation risk. Do not use recurrence as an eligibility gate.
6. Report the substantive candidate count honestly. Controls, merges, and evidence-limited items never inflate a requested candidate total.
7. For each substantive row, include observed trigger phrases, bounded action purpose, current owner/extension target, likely Prompt versus ProtoScript versus C# implementation, rough input/output contract, expected saved route, unresolved design questions, and the historical artifact references needed for later validation.

Write the complete Markdown portfolio with `ToWriteActionLearningPortfolio`, then read it back with `ToReadActionLearningPortfolio`. The portfolio must explicitly label its substantive-candidate section, calibration-controls appendix, and source artifact references. It must not contain placeholders or truncation markers.

This prompt does not grant the restricted child arbitrary file access and does not implement any candidate tool. If the work must continue in another turn, preserve the exact next step and return `ACTION_LEARNING_PORTFOLIO_CHECKPOINT: continue-required`. Return `ACTION_LEARNING_PORTFOLIO_COMPLETE` only after the fixed portfolio was written and read back.
