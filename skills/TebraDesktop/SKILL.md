# Tebra Desktop

Windows-only desktop UI automation for Tebra Desktop Practice Management. The skill reports process, window, lock, sign-in, and readiness state; prepares or signs in to Tebra; navigates to Patients; captures bounded UI Automation text; and searches an authorized patient workflow for note text.

## Requirements

- Windows with Tebra Desktop available to the interactive desktop session.
- The packaged DLL dependencies already present in `lib/`, including the Tebra UI automation and FlaUI assemblies.
- User secret key `TebraPassword` configured through UserSecrets. Never put its value in prompts, logs, source, or this package.

## Safe use

Status inspection is read-only. Prepare, navigation, and patient search actions can launch, unlock, sign in to, and interact with live Tebra. Use only authorized test or patient workflows, minimize exposure of patient information, request bounded UI snapshots, and always supply a bounded timeout. Do not use the automation to make unsupported clinical or administrative changes.

`index.pts` is the package entry point.