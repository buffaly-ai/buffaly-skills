# LinkedIn Interactive Component

`linkedin-module` is the self-contained registered Web Component entry for bounded read-only LinkedIn displays. It accepts configuration before `start()` and supports exact `published-post` (`postUrn`) and `draft-preview` (`draftId`) screens. It calls only existing read endpoints, verifies the returned record identity, renders its own markup, emits shared ready/error lifecycle events, and contains no publishing, editing, approval, scheduling, deletion, disconnection, or reply operations.
