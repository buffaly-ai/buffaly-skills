# Privacy Policy — Buffaly Browser Agent

Buffaly Browser Agent processes browser data only to perform actions requested through its side panel or an authorized local Buffaly connection.

## Data accessed

Depending on the requested tool, the extension can access the active page URL and title, visible page text, DOM element metadata, screenshots, console events, and text supplied for page input. Debugger-backed access requires explicit consent in the side panel and expires after four hours or when revoked.

## Data handling

The extension does not sell browser data, use it for advertising, or include analytics or tracking SDKs. Chrome extension storage contains only the user-configured Buffaly origin and session key; it does not contain browsing content, model responses, credentials, or page captures. Tool results are returned to the initiating local caller. The side panel keeps a bounded in-memory activity log for the current service-worker lifetime.

## Network behavior

The extension itself does not send page content to a developer-operated analytics or advertising endpoint. The side panel can embed the user-configured Buffaly installation's frame-enabled session shell. That iframe communicates directly with that Buffaly origin under its own authentication and data-processing configuration; it receives no direct Chrome extension API or debugger-consent access. When used with Buffaly, the separate Buffaly installation controls any subsequent model or service processing under that installation's configuration.

## Safety

Browser-internal URLs and file URLs are blocked. Payment-related selectors require confirmation, password selectors are rejected or redacted, and debugger attachment requires explicit side-panel consent. Runtime messages that invoke tools, change consent, or read logs are accepted only from the extension's own side-panel context.

## Contact

Privacy and support contact information must be supplied in the Chrome Web Store listing before publication.
