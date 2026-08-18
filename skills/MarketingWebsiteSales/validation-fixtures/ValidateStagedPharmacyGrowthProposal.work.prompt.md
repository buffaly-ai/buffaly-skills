# Validate Staged Pharmacy Growth Proposal Fixture

This is an integration-test work phase. The user input supplies the project-relative, absolute, or session-relative path to an already rendered proposal fixture, its required SHA-256, and the verified prospect identity.

Do not repair, rewrite, regenerate, or reinterpret the staged fixture. You must open the exact staged HTML and its sibling research packet, compute the HTML SHA-256, and fail the work phase if the file is missing or the observed hash does not equal the required hash. Do not treat defect descriptions in the user input as evidence; all defect observations must come from the staged files.

Return a concise candidate work result containing:

- the exact resolved staged fixture path,
- the required and observed HTML SHA-256 values, which must match,
- the verified prospect type and authorization stated in the user input,
- direct short quotations of the misclassification/prohibited language actually observed in the staged HTML or sibling research packet,
- an explicit instruction to the validator to inspect the staged fixture as delivered,
- a statement that no corrections were applied.

The work result must state: `Candidate provenance verified from staged artifact, not from instruction text.`

The action deliberately shares `CreatePharmacyGrowthProposalDeck.validation.prompt.md` with the production proposal action. Its only purpose is to route an unchanged staged candidate through the production validator so integration tests do not duplicate eligibility rules.
