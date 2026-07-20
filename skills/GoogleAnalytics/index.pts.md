# index.pts

- 2026-06-18: Added the first GoogleAnalytics ProtoScript skill bundle with primitive data-access tools for listing configured properties, testing GA4 access, and running generic reports through the Buffaly.Marketing C# facade.

- 2026-06-18: Aligned the skill prototype shape with existing working OpsAgent skills by using SkillEntity directly and setting EntityName explicitly for reliable action discovery.

- 2026-07-20: Replaced the package-local `lib/Buffaly.Marketing.dll` reference with assembly-name resolution so public extension reconciliation does not require a DLL copied into the source skill directory.
