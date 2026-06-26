# google-workspace-accounts.html Change History

## OAuth Settings and Troubleshooting Tabs (2026-06-03)
- Added Accounts, OAuth Settings, and Troubleshooting tab structure to the Google Workspace management page.
- Bumped the accounts JavaScript cache key for staging validation.

## Insert Tab Body Markup (2026-06-03)
- Fixed the management page body so the Accounts, OAuth Settings, and Troubleshooting tab markup is actually present in deployed HTML.

## Progressive Disclosure Cleanup (2026-06-03)
- Wrapped requested permissions, connection mode selection, and manual callback completion in details/summary blocks.
- Preserved existing JavaScript-bound element IDs while reducing the initial first-run page surface.

## Connected-Status First Layout (2026-06-04)
- Reworked the first-run panel so connected users see consolidated status first.
- Moved permissions into the side status column, moved OAuth mode controls into OAuth Settings, and kept sign-in troubleshooting hidden until Connect generates a URL.
