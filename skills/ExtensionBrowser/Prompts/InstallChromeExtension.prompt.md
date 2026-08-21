# Install the Buffaly Browser Agent Chrome extension

Install the **Buffaly Browser Agent** Chrome extension for the requested Buffaly instance and Chrome profile. Own the workflow through verification; do not stop after merely describing generic Chrome instructions when tools can continue.

## Contract

The installation has two independently verifiable sides:

1. The target Buffaly instance must have the `ExtensionBrowser` WebModule active and expose its instance-owned installer.
2. The target Chrome profile must load the prepared unpacked extension and authorize it against that Buffaly origin.

Use the target instance as the authoritative package source. Do not search local build artifacts, copy an installed extension from another profile, or download an arbitrary GitHub archive. The canonical entry point is:

`<origin>/web-modules/ExtensionBrowser/install`

The canonical bootstrap is:

`irm <origin>/web-modules/ExtensionBrowser/install-chrome.ps1 | iex`

## Workflow

1. Resolve the target Buffaly origin and Chrome profile from the request, current session/browser context, remembered environment entities, or available inspection tools. If the user says “this instance,” bind to the current Buffaly origin. Ask one targeted question only when multiple consequential targets remain after discovery.
2. Verify `<origin>/web-modules/ExtensionBrowser/health` is reachable and reports `ChromeExtensionVersion` and `ChromeExtensionSha256`. If the WebModule is missing or pending activation, install/activate that package through the typed extension-management workflow before continuing. Never patch core or an installed WebModule copy.
3. Open `<origin>/web-modules/ExtensionBrowser/install` for a visible, user-auditable entry point.
4. On Windows, run the origin-rendered bootstrap script through the approved local execution path. It must download from that same origin, verify the pinned SHA-256, validate the manifest name/version, and extract to `%LOCALAPPDATA%\Buffaly\ChromeExtensions\BuffalyBrowserAgent\<version>`.
5. Do not edit Chrome `Preferences`/`Secure Preferences`, synthesize extension registrations, or bypass Chrome’s confirmation. Use direct computer-interaction tools in the requested real Chrome profile to open `chrome://extensions`, enable Developer mode if necessary, click **Load unpacked**, and select the prepared version folder. If direct interaction is unavailable or the user has not approved interaction with the main Chrome profile, present the exact prepared folder and the single remaining confirmation instead.
6. Open the extension side panel. Add the target origin and complete its normal authorization redirect. Do not copy installation credentials or storage from another profile/instance.
7. Verify all available evidence:
   - Chrome shows **Buffaly Browser Agent** at the expected version;
   - the extension side panel reports the server Ready/authorized;
   - WebModule health reports the installation channel online;
   - record the Chrome extension ID because unpacked installations without a manifest public key may receive a path-derived ID;
   - verify the instance allows `chrome-extension://<extension-id>` for its embedded timeline before claiming the iframe is operational.
8. Report server origin, Chrome profile, extension version/ID, permanent folder, authorization/channel state, and any remaining explicit user action. Distinguish installed files, loaded extension, authorized server, and online channel; none implies all the others.

## Safety and scope

- Do not restart Buffaly, Chrome, IIS, or an app pool without the approval required by the active environment rules.
- Do not install into an isolated Playwright profile when the user requested their main Chrome profile.
- Do not claim automatic updates. Unpacked extensions require loading each new version folder; Chrome Web Store or managed-enterprise distribution is required for automatic installation/update.
- Do not expose installation credentials or authorization codes.
