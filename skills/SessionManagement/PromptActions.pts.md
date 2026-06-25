
## Remove Folder-Moving Archive Prompt Actions (2026-06-11)
- Removed `ToArchiveSystemCreatedHyphenSessionsSkill` and `ToArchiveSingleSessionByNameSkill` from the prompt-action surface.
- Design decision: Buffaly session archive/unarchive should use explicit SessionManagement tools backed by targeted session metadata APIs instead of old prompt workflows that move folders.
