# Validate Feeding Frenzy Website Service Order Addendum

Validate that the work result creates a complete service-order addendum for a Feeding Frenzy Growth Website or related website service package.

## Objective checks

Fail if any required addendum content is missing:

- If the work result indicates it is already executing inside a validated-prompt work turn, do not instruct it to call `ToCreateFeedingFrenzyWebsiteServiceOrderAddendumSkill`, `ToRunValidatedPromptSkill`, or the same workflow/action again. Feedback should ask for the missing concrete artifact, lead-field resolution, template application, Google Doc population, or manifest evidence directly.

- Identifies the client/prospect and service/order context.
- Includes scope of work, deliverables, exclusions/assumptions, timeline or dependency notes, price/package terms if provided, and approval/signature or next-step language.
- Separates sales/demo references from real implementation commitments.
- Uses only provided or verified commercial terms; marks missing terms as needed rather than inventing them.
- Produces a copyable addendum artifact, document text, or file path.
- Avoids legal/contract overreach beyond a practical service-order addendum.

## Subjective checks

Fail if the addendum is not ready for review:

- The language must be clear, professional, and business-safe.
- The scope must be concrete enough to avoid misunderstanding.
- The addendum should be easy for a salesperson or client to understand.
