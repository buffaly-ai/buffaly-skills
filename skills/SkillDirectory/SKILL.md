# Skill Directory

Agent-facing tools for the official Buffaly Skill Directory.

This skill intentionally uses the existing `Buffaly.Agent.SkillManagement.SkillDirectoryService` JsonWs service as the source of truth. ProtoScript actions are thin wrappers for search, detail lookup, install preview, and explicit install.

The actions do not duplicate installer logic. Remote package validation, allowed file types, DLL handling, replacement rules, and enable-after-install behavior remain in the C# SkillManagement web module service.
