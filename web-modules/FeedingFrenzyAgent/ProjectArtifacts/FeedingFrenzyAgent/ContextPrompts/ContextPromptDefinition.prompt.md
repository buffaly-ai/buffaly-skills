# ContextPrompt Definition

Purpose
- This is a definition/reference document for the core ontology concept `ContextPrompt`.
- It defines behavior framing and routing intent, not an executable action.

Core Distinction
- `PromptAction` answers what to do.
- `ContextPrompt` answers how to behave in a specific situation.

Context Routing via `ContextPhrase`
- `ContextPhrase` provides a natural-language situation key used to select overlay behavior.
- Example contexts:
	- when writing or modifying computer code
	- when responding to an SMS message
	- when responding to a real-time call

Execution Model
- A `ContextPrompt` is injected alongside the master prompt as a situational overlay.
- The master prompt remains the baseline contract; context overlay narrows style, pace, and response mode for the active situation.
