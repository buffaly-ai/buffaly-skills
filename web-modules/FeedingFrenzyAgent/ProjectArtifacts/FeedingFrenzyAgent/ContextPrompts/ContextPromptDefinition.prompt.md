# ContextPrompt Definition

Purpose
- This is a definition/reference document for the core ontology concept `ContextPrompt`.
- It defines behavior framing and routing intent, not an executable action.

Core Distinction
- `PromptAction` answers what to do.
- `ContextPrompt` answers how to behave in a specific situation.

Context Routing via `[SemanticContext("...")]`
- Each routed context declares its natural-language situation phrase with exactly one literal `[SemanticContext("...")]` annotation directly above `prototype Name : ContextPrompt`. The phrase is the situation key used to select overlay behavior.
- The annotation is the only phrase representation. Its argument must be one plain string literal; computed or interpolated values, a second `SemanticContext` annotation and the retired `ContextPhrase = ...` assignment are rejected when the source is read.
- The `SemanticContext` function declared in `Annotations.pts` does nothing during compilation. The context registration owner reads the literal from source and performs and verifies the semantic upsert.
- A context without the annotation is a legacy context that loads only when requested explicitly. An empty annotation, `[SemanticContext("")]`, marks a context retracted while keeping its content.
- Example contexts:
	- when writing or modifying computer code
	- when responding to an SMS message
	- when responding to a real-time call

Execution Model
- A `ContextPrompt` is injected alongside the master prompt as a situational overlay.
- The master prompt remains the baseline contract; context overlay narrows style, pace, and response mode for the active situation.
