# ToNormalizePossiblyStringRefHandleToString Troubleshooting Notes

## Summary
This normalizer is a safe boundary helper for possible StringRef-handle-like input values.

## Current behavior
- Returns input unchanged when empty or non-handle text.
- Detects handle-like prefixes:
  - `System.String[ref:`
  - `StringReference(`
- Currently returns handle text unchanged (no generic rehydrate API available in this layer).

## Why this exists
Some call paths deliver StringRef handles as plain strings at boundary. This helper avoids type-boundary exceptions and keeps behavior deterministic.

## If issue returns
1. Confirm caller expects string-normalization semantics (not typed-object rehydration).
2. Confirm upstream action boundary accepts `string` (especially `ToResolveStringReference`).
3. If typed rehydration is required, implement binder-side coercion in runtime C# layer and add tests.