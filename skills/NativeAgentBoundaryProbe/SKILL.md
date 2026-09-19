# Native agent boundary probe

Diagnostic package only. It loads a standalone .NET DLL and tests passing the installed Buffaly operation token into C#. It does not invoke either vendor or supply the production integrations.

`ToDescribeNativeToolBoundaryProbe` returns assembly/runtime metadata. `ToStartNativeToolCancellationProbe` waits for normal completion or cancellation from Buffaly's existing Stop path. When the host aborts interpretation before the result is displayed, use `ToReadNativeToolBoundaryProbeResult` in the same host process to inspect the diagnostic handle shown in tool output; do not treat an empty UI response as proof of cancellation. The diagnostic handle is deliberately shown only for this disposable phase-0 test; never adopt that presentation for production model output.

The sample `.pts` uses the repository's reference/import/action conventions but has not been compiled in a live Buffaly installation. Validate it first. Extend it to capture explicit tool/UI identity and exercise live-input cancellation as required by the handoff. A limited number of retained probe handles is intentional; release them or restart the disposable test host after an aborted diagnostic.
